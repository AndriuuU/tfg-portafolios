import html2pdf from 'html2pdf.js';

/**
 * Descargar portfolio como PDF
 * Genera un PDF con estilo HTML desde el cliente
 */
export const downloadPortfolioPDF = async (portfolioHTML) => {
  try {
    if (!portfolioHTML) {
      return {
        success: false,
        message: 'Error: no hay contenido para exportar',
      };
    }

    // Crear elemento wrapper
    const element = document.createElement('div');
    element.innerHTML = portfolioHTML;
    element.style.backgroundColor = 'white';
    element.style.padding = '20px';

    // Configuración de html2pdf
    const options = {
      margin: [15, 15, 15, 15],
      filename: `portfolio_${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        logging: false,
        allowTaint: true,
        useCORS: true,
        backgroundColor: '#ffffff'
      },
      jsPDF: {
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // Generar PDF
    await html2pdf().set(options).from(element).save();

    return {
      success: true,
      message: 'Portfolio exportado correctamente',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error al descargar el PDF',
    };
  }
};

/**
 * Descargar proyecto como PDF
 * Genera un PDF con estilo HTML desde el cliente
 */
export const downloadProjectPDF = async (projectHTML) => {
  try {
    if (!projectHTML) {
      return {
        success: false,
        message: 'Error: no hay contenido para exportar',
      };
    }

    // Crear elemento wrapper
    const element = document.createElement('div');
    element.innerHTML = projectHTML;
    element.style.backgroundColor = 'white';
    element.style.padding = '20px';

    // Configuración de html2pdf
    const options = {
      margin: [15, 15, 15, 15],
      filename: `proyecto_${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        logging: false,
        allowTaint: true,
        useCORS: true,
        backgroundColor: '#ffffff'
      },
      jsPDF: {
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // Generar PDF
    await html2pdf().set(options).from(element).save();

    return {
      success: true,
      message: 'Proyecto exportado correctamente',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error al descargar el PDF',
    };
  }
};
