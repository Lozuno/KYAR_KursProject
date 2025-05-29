document.addEventListener('DOMContentLoaded', function() {
    const routeMapImage = document.getElementById('routeMapImage');
    const mapModal = document.getElementById('mapModal');
    const modalMapImage = document.getElementById('modalMapImage');
    const closeModal = document.querySelector('.close-modal');
    const zoomInBtn = document.getElementById('zoomIn');
    const zoomOutBtn = document.getElementById('zoomOut');
    const resetZoomBtn = document.getElementById('resetZoom');
    
    let currentZoom = 1;
    let posX = 0;
    let posY = 0;
    let startPosX, startPosY, startX, startY;
    let isDragging = false;
    
    if (routeMapImage && mapModal) {
        routeMapImage.addEventListener('click', function(e) {
            // Не блокируем клик на карту
            mapModal.style.display = 'flex';
            resetZoom();
        });
    }
    
    if (closeModal && mapModal) {
        closeModal.addEventListener('click', function() {
            mapModal.style.display = 'none';
        });
    }
    
    window.addEventListener('click', function(event) {
        if (event.target === mapModal) {
            mapModal.style.display = 'none';
        }
    });
    
    if (zoomInBtn && modalMapImage) {
        zoomInBtn.addEventListener('click', function() {
            if (currentZoom < 3) {
                currentZoom += 0.2;
                updateTransform();
            }
        });
    }
    
    if (zoomOutBtn && modalMapImage) {
        zoomOutBtn.addEventListener('click', function() {
            if (currentZoom > 0.5) {
                currentZoom -= 0.2;
                updateTransform();
            }
        });
    }
    
    if (resetZoomBtn) {
        resetZoomBtn.addEventListener('click', resetZoom);
    }
    
    function resetZoom() {
        currentZoom = 1;
        posX = 0;
        posY = 0;
        updateTransform();
    }
    
    function updateTransform() {
        if (modalMapImage) {
            modalMapImage.style.transform = `translate(${posX}px, ${posY}px) scale(${currentZoom})`;
        }
    }
    
    if (modalMapImage) {
        modalMapImage.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);
        
        modalMapImage.addEventListener('touchstart', startDrag);
        document.addEventListener('touchmove', drag);
        document.addEventListener('touchend', endDrag);
        
        modalMapImage.addEventListener('wheel', function(e) {
            e.preventDefault();
            
            // Определение направления прокрутки
            const delta = e.deltaY || e.detail || e.wheelDelta;
            
            if (delta > 0 && currentZoom > 0.5) {
                currentZoom -= 0.1;
            } else if (delta < 0 && currentZoom < 3) {
                currentZoom += 0.1;
            }
            
            updateTransform();
        });
    }
    
    function startDrag(e) {
        e.preventDefault();
        isDragging = true;
        
        if (e.type === 'touchstart') {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        } else {
            startX = e.clientX;
            startY = e.clientY;
        }
        
        startPosX = posX;
        startPosY = posY;
    }
    
    function drag(e) {
        if (!isDragging) return;
        e.preventDefault();
        
        let clientX, clientY;
        if (e.type === 'touchmove') {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        posX = startPosX + (clientX - startX);
        posY = startPosY + (clientY - startY);
        
        updateTransform();
    }
    
    function endDrag() {
        isDragging = false;
    }
}); 