const fs = require('fs');
const escpos = require('escpos');
const escposUSB = require('escpos-usb');
const MarkdownIt = require('markdown-it');
const util = require('util');

// Promisify fs.readFile for easier use with async/await
const readFileAsync = util.promisify(fs.readFile);

class MarkdownPrinter {
  constructor() {
    this.device = new escposUSB(); // Adjust if not using USB
    this.printer = new escpos.Printer(this.device);
    this.md = new MarkdownIt();
  }

  // Parse the Markdown file into plain text
  async parseMarkdown(filePath) {
    try {
      const data = await readFileAsync(filePath, 'utf8');
      // Convert Markdown to plain text (strip HTML tags)
      const plainText = this.md.render(data).replace(/<\/?[^>]+(>|$)/g, '');
      return plainText;
    } catch (err) {
      throw new Error('Error reading file');
    }
  }

  // Print text to the thermal printer
  async printText(text) {
    return new Promise((resolve, reject) => {
      this.device.open(() => {
        try {
          this.printer
            .text(text)
            .cut()
            .close();
          resolve('Print job sent successfully');
        } catch (error) {
          reject('Error sending print job');
        }
      });
    });
  }

  // Combine parsing and printing into one operation
  async printMarkdownFile(filePath) {
    try {
      const plainText = await this.parseMarkdown(filePath);
      return await this.printText(plainText);
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

module.exports = MarkdownPrinter;
