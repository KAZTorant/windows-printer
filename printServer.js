// printServer.js
const express = require('express');
const fileUpload = require('express-fileupload');
const { exec } = require('child_process');
const fs = require('fs');

// Create an Express app
const app = express();
const port = 3000;

// Middleware for parsing JSON and handling file uploads
app.use(express.json());
app.use(fileUpload());

// Endpoint to receive an uploaded .md file
app.post('/print/windows/file', (req, res) => {
  // Ensure that a file was uploaded
  if (!req.files || !req.files.markdownFile) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Access the uploaded file
  const markdownFile = req.files.markdownFile;

  // Read the contents of the uploaded file directly from memory
  const fileContent = markdownFile.data.toString('utf8');

  // Escape double quotes in the file content to avoid PowerShell issues
  const escapedContent = fileContent.replace(/"/g, '""');

  // Construct a PowerShell command to print the file content
  // Execute PowerShell command with better error handling
  const psCommand = `echo "${escapedContent}" | Out-Printer`;
  console.log({psCommand})
  exec(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${psCommand}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Execution Error: ${error.message}`);
      return res.status(500).json({ error: 'Printing error', details: error.message });
    }
    if (stderr) {
      console.error(`Standard Error: ${stderr}`);
      return res.status(500).json({ error: 'Printing issue', details: stderr });
    }

    console.log(`Output: ${stdout}`);
    res.json({ success: true, message: 'File printed successfully' });
  });

});

// Start the server on all interfaces
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is listening at http://0.0.0.0:${port}`);
});
