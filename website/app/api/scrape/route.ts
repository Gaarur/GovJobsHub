import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Path to the main project root
    const projectRoot = path.resolve(process.cwd(), '..'); 
    // Command to run the CLI script
    // We use npx ts-node to run the typescript file directly from the parent directory
    const command = `npx ts-node "${path.join(projectRoot, 'src/tools/scrape_cli.ts')}" --url="${url}"`;

    return new Promise((resolve) => {
        exec(command, { cwd: projectRoot }, (error, stdout, stderr) => {
            if (error) {
                console.error('Scraper error:', stderr);
                resolve(NextResponse.json({ error: 'Failed to scrape', details: stderr }, { status: 500 }));
                return;
            }

            // Extract JSON output
            try {
                const match = stdout.match(/JSON_START([\s\S]*)JSON_END/);
                if (match && match[1]) {
                    const data = JSON.parse(match[1]);
                    resolve(NextResponse.json({ success: true, count: data.length, jobs: data }));
                } else {
                    resolve(NextResponse.json({ success: true, count: 0, message: 'No structured jobs found' }));
                }
            } catch (e) {
                resolve(NextResponse.json({ error: 'Invalid output from scraper' }, { status: 500 }));
            }
        });
    });

  } catch (e) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
