import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface ItemsData {
    name: string;
    priceAtSale: number;
    quantity: number;
    subtotal: number;
}

export interface ReceiptData {
    saleId: string;
    date: string;
    items: ItemsData[];
    total: number;
    sellerName: string;
}

// Interface para evitar o erro 'property lastAutoTable does not exist'
interface UserOptionsExtended extends jsPDF {
    lastAutoTable?: {
        finalY: number;
    };
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

/**
 * @param data Dados da venda
 * @param existingWindow Referência da janela aberta no componente para evitar bloqueio de pop-up
 */
export const generateReceipt = (data: ReceiptData, existingWindow?: Window | null) => {
    const doc = new jsPDF();

    // 1. Cabeçalho
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('STOCKFLOW - RECIBO DE VENDA', 105, 20, { align: 'center' });

    // 2. Informações da venda
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`ID da Fatura: ${data.saleId}`, 14, 35);
    doc.text(`Data: ${new Date(data.date).toLocaleString('pt-BR')}`, 14, 42);
    doc.text(`Vendedor: ${data.sellerName}`, 14, 49);

    // 3. Tabela de Itens
    const tableColumn = ["Produto", "Preço Unit.", "Qtd", "Subtotal"];
    // Tratativa para garantir que items não seja undefined
    const tableRows = (data.items || []).map(item => [
        item.name,
        formatCurrency(item.priceAtSale),
        item.quantity,
        formatCurrency(item.subtotal)
    ]);

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 55,
        theme: 'striped',
        headStyles: { fillColor: [66, 153, 255] },
        styles: { fontSize: 9 }
    });

    // 4. Cálculos de posição (Usando a interface estendida)
    const finalY = (doc as UserOptionsExtended).lastAutoTable?.finalY || 60;

    // 5. Total
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL: ${formatCurrency(data.total)}`, 196, finalY + 15, { align: 'right' });

    // 6. Rodapé
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text('Obrigado pela preferência!', 105, finalY + 30, { align: 'center' });

    // --- SAÍDA DO ARQUIVO ---

    // Gerar o Blob do PDF
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);

    if (existingWindow) {
        // Se a janela já foi aberta (antes do await da API), apenas mudamos o endereço dela
        existingWindow.location.href = url;
    } else {
        // Fallback: abre nova aba (sujeito a bloqueio de pop-up se chamado após await)
        window.open(url, '_blank');
    }

    // Download automático opcional (Backup)
    doc.save(`recibo-${data.saleId.substring(0, 8)}.pdf`);

    // Limpeza de memória
    setTimeout(() => URL.revokeObjectURL(url), 5000);
};

