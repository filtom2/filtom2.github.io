document.addEventListener('DOMContentLoaded', function() {
  // Get all folder headers
  const folderHeaders = document.querySelectorAll('.folder-header');
  
  // Add click event to each folder header
  folderHeaders.forEach(header => {
    header.addEventListener('click', function() {
      // Toggle the 'open' class on the header
      this.classList.toggle('open');
      
      // Toggle folder icons
      const folderIcon = this.querySelector('.folder-icon');
      const folderIconOpen = this.querySelector('.folder-icon-open');
      
      if (folderIcon && folderIconOpen) {
        folderIcon.style.display = this.classList.contains('open') ? 'none' : 'inline-block';
        folderIconOpen.style.display = this.classList.contains('open') ? 'inline-block' : 'none';
      }
      
      // Get the next sibling which should be the folder content
      const folderContent = this.nextElementSibling;
      
      if (folderContent && folderContent.classList.contains('folder-content')) {
        // Toggle display property
        if (this.classList.contains('open')) {
          folderContent.style.display = 'block';
        } else {
          folderContent.style.display = 'none';
        }
      }
    });
  });
});
