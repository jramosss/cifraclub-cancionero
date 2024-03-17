document.getElementById('generateBtn').addEventListener('click', function() {
  // Get the button element
  var generateButton = document.getElementById('generateBtn');
  // Disable the button
  generateButton.disabled = true;
  // Change the button text to indicate loading
  generateButton.innerText = 'Generating...';

  var url = document.getElementById('urlInput').value;
  fetch(`/generate/?list_url=${url}`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ list_url: url })
  })
  .then(res => res.blob())
  .then(blob => {
      var url = window.URL.createObjectURL(blob);
      var downloadBtn = document.getElementById('download-btn');
      downloadBtn.href = url;
      downloadBtn.style.display = 'inline-block';
      // Re-enable the generate button
      generateButton.disabled = false;
      // Restore the original text
      generateButton.innerText = 'Generate';
  })
  .catch(error => {
      console.error('Error:', error);
      alert('Error generating file');
      // Re-enable the generate button
      generateButton.disabled = false;
      // Restore the original text
      generateButton.innerText = 'Generate';
  });
});