// Active le bon bouton dans la sidebar
document.querySelectorAll(".nav-item").forEach(item => {
    if (item.href === window.location.href) {
        item.classList.add("active");
    }
});