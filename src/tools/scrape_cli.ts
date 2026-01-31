import { UniversalScraper } from '../scrapers/universal';
import { MarkdownGenerator } from '../core/generator';
import * as path from 'path';

async function run() {
    const args = process.argv.slice(2);
    const urlArg = args.find(a => a.startsWith('--url='));
    
    if (!urlArg) {
        console.error('Usage: ts-node scrape_cli.ts --url=<url>');
        process.exit(1);
    }
    
    const url = urlArg.split('=')[1];
    
    try {
        const scraper = new UniversalScraper();
        scraper.setTarget(url);
        
        console.log(`JSON_START`); // Marker for parsing
        const jobs = await scraper.scrape();
        
        // Generate content
        const generator = new MarkdownGenerator(path.resolve('content/jobs'));
        for (const job of jobs) {
            await generator.generate(job);
        }
        
        console.log(JSON.stringify(jobs));
        console.log(`JSON_END`);
        
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

run();
