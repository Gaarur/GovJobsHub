import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

const url = 'https://uppsc.up.nic.in/CandidatePages/Notifications.aspx';
const outputPath = path.resolve('temp_upsc.html');

async function fetchPage() {
  try {
    console.log(`Fetching ${url}...`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    fs.writeFileSync(outputPath, response.data);
    console.log(`Saved HTML to ${outputPath}`);
  } catch (error) {
    console.error('Error fetching page:', error);
  }
}

fetchPage();
