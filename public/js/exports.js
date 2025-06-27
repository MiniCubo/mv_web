async function createImageData() {
    const scheduler = document.getElementById('scheduler');
    
    if (!scheduler?.children.length) {
        alert('Please generate a schedule first!');
        return null;
    }

    showLoading(true);

    try {
        // Create a print-style container for export
        const exportContainer = document.createElement('div');
        exportContainer.className = 'export-container';
        Object.assign(exportContainer.style, {
            width: '100%',
            padding: '10px',
            backgroundColor: 'white'
        });

        const grid = document.createElement('div');
        grid.className = 'export-grid';
        Object.assign(grid.style, {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            gap: '8px',
            width: '100%'
        });

        const dayBoxes = Array.from(scheduler.querySelectorAll('.day-box'));
        dayBoxes.forEach(box => {
            const exportBox = box.cloneNode(true);
            
            // Remove select element
            const select = exportBox.querySelector('select');
            select?.remove();
            
            // Apply compact styles
            Object.assign(exportBox.style, {
                width: '100px',
                height: '150px',
                padding: '5px',
                margin: '0',
                fontSize: '10px'
            });
            
            // Compact image container
            const imgContainer = exportBox.querySelector('.image-container');
            if (imgContainer) {
                Object.assign(imgContainer.style, {
                    height: '50px',
                    margin: '2px 0'
                });
            }
            
            // Compact comment area
            const textarea = exportBox.querySelector('textarea');
            if (textarea) {
                Object.assign(textarea.style, {
                    minHeight: '30px',
                    fontSize: '9px',
                    padding: '2px'
                });
            }
            
            grid.appendChild(exportBox);
        });
        
        exportContainer.appendChild(grid);
        document.body.appendChild(exportContainer);

        const canvas = await html2canvas(exportContainer, {
            backgroundColor: '#ffffff',
            scale: isMobile ? 1.5 : 2,
            useCORS: true,
            allowTaint: true,
            scrollX: 0,
            scrollY: 0,
            logging: true
        });

        exportContainer.remove();

        return {
            dataUrl: canvas.toDataURL('image/png'),
            width: canvas.width,
            height: canvas.height
        };
    } catch (error) {
        console.error('Image creation error:', error);
        alert('Failed to create image data. Please try again.');
        return null;
    } finally {
        showLoading(false);
    }
}

async function createPDFPages() {
    const scheduler = document.getElementById('scheduler');
    
    if (!scheduler?.children.length) {
        alert('Please generate a schedule first!');
        return null;
    }

    showLoading(true);

    try {
        const dayBoxes = Array.from(scheduler.querySelectorAll('.day-box'));
        const itemsPerPage = 20; // 5x4 grid per page (similar to PNG layout)
        const pages = [];

        // Split day boxes into pages
        for (let i = 0; i < dayBoxes.length; i += itemsPerPage) {
            const pageItems = dayBoxes.slice(i, i + itemsPerPage);
            
            // Create page container with proper A4 dimensions and margins
            const pageContainer = document.createElement('div');
            pageContainer.className = 'pdf-page-container';
            Object.assign(pageContainer.style, {
                width: '794px', // A4 width in pixels at 96 DPI
                height: '1123px', // A4 height in pixels at 96 DPI
                padding: '30px', // Reduced padding for more content space
                backgroundColor: 'white',
                boxSizing: 'border-box',
                position: 'relative'
            });

            // Add title with better spacing
            const title = document.createElement('h2');
            title.textContent = `Schedule - Page ${Math.floor(i / itemsPerPage) + 1}`;
            Object.assign(title.style, {
                margin: '0 0 25px 0',
                fontSize: '22px',
                textAlign: 'center',
                color: '#333'
            });
            pageContainer.appendChild(title);

            // Create grid similar to PNG layout (5 columns, 4 rows)
            const grid = document.createElement('div');
            Object.assign(grid.style, {
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '12px',
                width: '100%',
                height: 'calc(100% - 55px)', // Account for title and bottom margin
                alignContent: 'start' // Align items to top to prevent stretching
            });

            pageItems.forEach(box => {
                const pdfBox = box.cloneNode(true);
                
                // Remove select element
                const select = pdfBox.querySelector('select');
                select?.remove();
                
                // Apply PNG-like compact styles
                Object.assign(pdfBox.style, {
                    width: '100%',
                    height: '200px', // Fixed height to prevent overflow
                    padding: '8px',
                    margin: '0',
                    fontSize: '11px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    backgroundColor: '#f9f9f9',
                    display: 'flex',
                    flexDirection: 'column',
                    boxSizing: 'border-box',
                    overflow: 'hidden' // Prevent content overflow
                });
                
                // Style header
                const header = pdfBox.querySelector('h6');
                if (header) {
                    Object.assign(header.style, {
                        fontSize: '12px',
                        marginBottom: '4px',
                        color: '#333',
                        lineHeight: '1.2',
                        flex: '0 0 auto'
                    });
                }

                // Style date
                const fullDate = pdfBox.querySelector('.full-date');
                if (fullDate) {
                    Object.assign(fullDate.style, {
                        fontSize: '10px',
                        marginBottom: '6px',
                        color: '#666',
                        flex: '0 0 auto'
                    });
                }
                
                // Style image container (similar to PNG)
                const imgContainer = pdfBox.querySelector('.image-container');
                if (imgContainer) {
                    Object.assign(imgContainer.style, {
                        height: '60px',
                        margin: '4px 0',
                        border: '1px dashed #999',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flex: '0 0 auto'
                    });
                    
                    const img = imgContainer.querySelector('.selected-image');
                    if (img) {
                        Object.assign(img.style, {
                            width: '50px',
                            height: '50px',
                            objectFit: 'cover',
                            borderRadius: '3px'
                        });
                    }
                }
                
                // Style comment area (similar to PNG)
                const textarea = pdfBox.querySelector('textarea');
                if (textarea) {
                    // Convert textarea to div for better PDF rendering
                    const commentDiv = document.createElement('div');
                    Object.assign(commentDiv.style, {
                        width: '100%',
                        minHeight: '80px',
                        maxHeight: '80px', // Limit height to prevent overflow
                        fontSize: '10px',
                        padding: '6px',
                        border: '1px solid #ddd',
                        borderRadius: '3px',
                        backgroundColor: 'white',
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        overflow: 'hidden',
                        flex: '1 1 auto',
                        boxSizing: 'border-box'
                    });
                    
                    // Truncate text if too long
                    let text = textarea.value;
                    if (text.length > 150) {
                        text = text.substring(0, 147) + '...';
                    }
                    commentDiv.textContent = text;
                    
                    const commentSection = textarea.closest('.comment-section');
                    if (commentSection) {
                        commentSection.replaceChild(commentDiv, textarea);
                    }
                }
                
                grid.appendChild(pdfBox);
            });
            
            pageContainer.appendChild(grid);
            
            // Add bottom clearance
            const bottomClearance = document.createElement('div');
            Object.assign(bottomClearance.style, {
                height: '20px',
                width: '100%'
            });
            pageContainer.appendChild(bottomClearance);
            
            document.body.appendChild(pageContainer);

            // Create canvas for this page with higher quality
            const canvas = await html2canvas(pageContainer, {
                backgroundColor: '#ffffff',
                scale: 2,
                useCORS: true,
                allowTaint: true,
                scrollX: 0,
                scrollY: 0,
                width: 794,
                height: 1123,
                logging: false
            });

            pages.push({
                dataUrl: canvas.toDataURL('image/png', 0.95), // Slightly compress for smaller file size
                width: canvas.width,
                height: canvas.height
            });

            pageContainer.remove();
        }

        return pages;
    } catch (error) {
        console.error('PDF pages creation error:', error);
        alert('Failed to create PDF pages. Please try again.');
        return null;
    } finally {
        showLoading(false);
    }
}

async function exportToPDF() {
    if (!window.jspdf) {
        alert('PDF library not loaded. Please try again later.');
        return;
    }

    const pages = await createPDFPages();
    if (!pages || pages.length === 0) return;

    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // A4 dimensions in mm
        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 10; // Margin for safety

        pages.forEach((page, index) => {
            if (index > 0) {
                pdf.addPage();
            }

            // Calculate dimensions to fit A4 with margins
            const availableWidth = pageWidth - (margin * 2);
            const availableHeight = pageHeight - (margin * 2);
            
            const imgAspectRatio = page.width / page.height;
            const pageAspectRatio = availableWidth / availableHeight;
            
            let imgWidth, imgHeight;
            
            if (imgAspectRatio > pageAspectRatio) {
                // Image is wider than available space
                imgWidth = availableWidth;
                imgHeight = availableWidth / imgAspectRatio;
            } else {
                // Image is taller than available space
                imgHeight = availableHeight;
                imgWidth = availableHeight * imgAspectRatio;
            }

            // Center the image within margins
            const xPos = margin + (availableWidth - imgWidth) / 2;
            const yPos = margin + (availableHeight - imgHeight) / 2;

            pdf.addImage(
                page.dataUrl, 
                'PNG',
                xPos,
                yPos,
                imgWidth,
                imgHeight,
                undefined,
                'FAST'
            );
        });

        const today = new Date().toISOString().split('T')[0];
        pdf.save(`schedule-${today}.pdf`);
        
        console.log(`PDF exported with ${pages.length} pages`);
    } catch (error) {
        console.error('PDF export failed:', error);
        alert('PDF export failed. Please try again.');
    }
}

async function exportToPNG() {
    const imageData = await createImageData();
    if (!imageData) return;

    try {
        const link = document.createElement('a');
        link.href = imageData.dataUrl;
        link.download = `schedule-${new Date().toISOString().split('T')[0]}.png`;
        
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
            link.remove();
        }, 100);
    } catch (error) {
        console.error('PNG export failed:', error);
        alert('PNG export failed. Please try again.');
    }
}

// function printSchedule() {
//     const scheduler = document.getElementById('scheduler');
    
//     if (!scheduler.children.length) {
//         alert('Please generate a schedule first!');
//         return;
//     }

//     showLoading(true);

//     // Create a print container with grid layout
//     const printContainer = document.createElement('div');
//     printContainer.className = 'scheduler-container';
//     printContainer.style.display = 'grid';
//     printContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(180px, 1fr))';
//     printContainer.style.gap = '15px';
//     printContainer.style.width = '100%';
//     printContainer.style.padding = '20px';
    
//     const dayBoxes = Array.from(scheduler.children);
    
//     dayBoxes.forEach((box, index) => {
//         const printBox = box.cloneNode(true);
//         printBox.style.width = '180px';
//         printBox.style.height = '320px';
//         printBox.style.margin = '0';
//         printBox.style.pageBreakInside = 'avoid';
        
//         // Replace textareas with divs
//         const textarea = printBox.querySelector('textarea');
//         if (textarea) {
//             const div = document.createElement('div');
//             div.className = 'comment-content';
//             div.style.width = '100%';
//             div.style.minHeight = '60px';
//             div.style.padding = '6px';
//             div.style.border = '1px solid #ccc';
//             div.style.whiteSpace = 'pre-wrap';
//             div.textContent = textarea.value;
//             textarea.parentNode.replaceChild(div, textarea);
//         }
        
//         printContainer.appendChild(printBox);
//     });

//     const printWindow = window.open('', '_blank');
//     printWindow.document.write(`
//         <html>
//         <head>
//             <title>Schedule</title>
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <style>
//                 body { 
//                     font-family: Arial, sans-serif; 
//                     margin: 0;
//                     padding: 20px;
//                     background: white;
//                 }
//                 .scheduler-container {
//                     display: grid;
//                     grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
//                     gap: 15px;
//                     width: 100%;
//                 }
//                 .selected-image {
//                     max-width: 100%;
//                     max-height: 80px;
//                     display: block;
//                     margin: 0 auto;
//                 }
//                 .day-box {
//                     width: 180px;
//                     height: 320px;
//                     border: 2px solid #aaa;
//                     text-align: center;
//                     padding: 10px;
//                     background: #f9f9f9;
//                     page-break-inside: avoid;
//                     display: inline-block;
//                     vertical-align: top;
//                 }
//                 /* Rest of your print styles... */
//             </style>
//         </head>
//         <body>
//             <h1>Schedule</h1>
//             ${printContainer.innerHTML}
//             <script>
//                 window.onload = function() {
//                     setTimeout(function() {
//                         window.print();
//                         window.close();
//                     }, 500);
//                 };
//                 document.querySelectorAll('img').forEach(img => {
//                     img.src = img.src + '?t=' + new Date().getTime();
//                 });
//                 setTimeout(() => window.print(), 300);
//             </script>
//         </body>
//         </html>
//     `);
    
//     printWindow.document.close();
//     showLoading(false);
// }