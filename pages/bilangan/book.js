class Book {
  constructor() {
    this.currentPage = 0;
    this.totalPages = 0;
    this.pages = [];
    this.init();
  }

  init() {
    // Setup event listeners
    document.getElementById('prevPage')?.addEventListener('click', () => this.prevPage());
    document.getElementById('nextPage')?.addEventListener('click', () => this.nextPage());
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prevPage();
      if (e.key === 'ArrowRight') this.nextPage();
    });

    // Initialize pages
    this.pages = Array.from(document.querySelectorAll('.page'));
    this.totalPages = this.pages.length;
    this.updatePageNumbers();
    this.updateNavigation();
    this.initProgressBar();
    
    // Show first page
    if (this.pages.length > 0) {
      this.pages[0].classList.add('current');
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.pages[this.currentPage].classList.add('flipped');
      this.currentPage++;
      this.updateNavigation();
      this.updateProgress();
    }
  }

  prevPage() {
    if (this.currentPage > 0) {
      this.pages[this.currentPage - 1].classList.remove('flipped');
      this.currentPage--;
      this.updateNavigation();
      this.updateProgress();
    }
  }

  goToPage(pageNumber) {
    if (pageNumber >= 0 && pageNumber < this.totalPages) {
      // Reset all pages
      this.pages.forEach((page, index) => {
        if (index < pageNumber) {
          page.classList.add('flipped');
        } else {
          page.classList.remove('flipped');
        }
      });
      this.currentPage = pageNumber;
      this.updateNavigation();
      this.updateProgress();
    }
  }

  updateNavigation() {
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    if (prevBtn) {
      prevBtn.disabled = this.currentPage === 0;
    }
    if (nextBtn) {
      nextBtn.disabled = this.currentPage === this.totalPages - 1;
    }

    // Update current page indicator
    const pageIndicator = document.getElementById('pageIndicator');
    if (pageIndicator) {
      pageIndicator.textContent = `Halaman ${this.currentPage + 1} dari ${this.totalPages}`;
    }
  }

  updatePageNumbers() {
    this.pages.forEach((page, index) => {
      const pageNumber = document.createElement('div');
      pageNumber.className = `page-number ${index % 2 === 0 ? 'left' : 'right'}`;
      pageNumber.textContent = index + 1;
      page.appendChild(pageNumber);
    });
  }

  initProgressBar() {
    const progressBar = document.querySelector('.progress-bar');
    if (!progressBar) return;

    // Update initial progress
    this.updateProgress();

    // Update progress on scroll for current page
    this.pages.forEach(page => {
      page.addEventListener('scroll', () => {
        if (!page.classList.contains('flipped') && 
            page.classList.contains('current')) {
          this.updateProgress();
        }
      });
    });
  }

  updateProgress() {
    const progressBar = document.querySelector('.progress-bar');
    if (!progressBar) return;

    const progress = ((this.currentPage + 1) / this.totalPages) * 100;
    progressBar.style.width = `${progress}%`;

    // Update chapter in ToC
    const tocItems = document.querySelectorAll('.toc-item');
    tocItems.forEach((item, index) => {
      if (index === this.currentPage) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  // Add bookmark
  addBookmark() {
    const bookmark = document.createElement('div');
    bookmark.className = 'bookmark';
    this.pages[this.currentPage].appendChild(bookmark);
  }
}

// Initialize book when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const book = new Book();

  // Handle table of contents clicks
  document.querySelectorAll('.toc-item').forEach((item, index) => {
    item.addEventListener('click', () => {
      book.goToPage(index);
    });
  });

  // Initialize tooltips if any
  const tooltips = document.querySelectorAll('[data-tooltip]');
  tooltips.forEach(tooltip => {
    tooltip.addEventListener('mouseover', (e) => {
      const tip = document.createElement('div');
      tip.className = 'tooltip';
      tip.textContent = e.target.dataset.tooltip;
      document.body.appendChild(tip);
      
      const rect = e.target.getBoundingClientRect();
      tip.style.top = `${rect.top - tip.offsetHeight - 10}px`;
      tip.style.left = `${rect.left + (rect.width/2) - (tip.offsetWidth/2)}px`;
    });

    tooltip.addEventListener('mouseout', () => {
      document.querySelector('.tooltip')?.remove();
    });
  });
});