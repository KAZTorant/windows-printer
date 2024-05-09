// printServer.js
const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');

// Create an Express app
const app = express();
const port = 3000;

// Set up Multer for handling file uploads
const upload = multer({ dest: 'uploads/' });

// Endpoint to receive an uploaded .md file
app.post('/print/windows/file', upload.single('markdownFile'), (req, res) => {
  // Ensure a file was uploaded
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Read the contents of the uploaded file
  const filePath = req.file.path;
  fs.readFile(filePath, 'utf8', (err, fileContent) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read uploaded file' });
    }

    // Construct a PowerShell command to print the file content
    const psCommand = `echo "${fileContent}" | Out-Printer`;

    // Execute the PowerShell command to print the content
    exec(`powershell -Command "${psCommand}"`, (error, stdout, stderr) => {
      // Cleanup the uploaded file
      fs.unlinkSync(filePath);

      if (error) {
        console.error(`Error: ${error.message}`);
        return res.status(500).json({ error: 'Printing error', details: error.message });
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return res.status(500).json({ error: 'Printing issue', details: stderr });
      }

      console.log(`Output: ${stdout}`);
      res.json({ success: true, message: 'File printed successfully' });
    });
  });
});

// Start the server
app.listen(port, '0.0.0.0',() => {
  console.log(`Server is listening at http://0.0.0.0:${port}`);
});
