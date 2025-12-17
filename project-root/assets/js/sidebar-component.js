class SidebarComponent extends HTMLElement {
  connectedCallback() {
    // Placeholder pour éviter le flash de layout
    this.innerHTML = `
        <div class="sidebar-placeholder"></div>
    `;

    // Chargement réel de la sidebar
    this.loadSidebar();
  }

  loadSidebar() {
    fetch("../layout/sidebar.html")
      .then(res => res.text())
      .then(html => {
        this.innerHTML = html;
        this.highlightActiveNav();
      })
      .catch(err => {
        console.error("Sidebar load failed", err);
      });
  }

  highlightActiveNav() {
    const currentPath = SidebarComponent.normalizePath(window.location.pathname);
    this.querySelectorAll(".nav-item").forEach(link => {
      const href = link.getAttribute("href");
      if (!href) return;
      const normalizedHref = SidebarComponent.normalizePath(href);
      link.classList.toggle("active", normalizedHref === currentPath);
    });
  }

  static normalizePath(path = "") {
    try {
      // Extraire juste le nom du fichier pour la comparaison
      const url = new URL(path, window.location.origin);
      let pathname = url.pathname;
      
      // Normaliser pour la comparaison
      if (pathname.endsWith('/')) {
        pathname = pathname.slice(0, -1);
      }
      
      return pathname;
    } catch (e) {
      return path;
    }
  }
}

customElements.define("app-sidebar", SidebarComponent);
