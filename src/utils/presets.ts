import { PresetTemplate } from '../types';

export const DEFAULT_PRESETS: PresetTemplate[] = [
  {
    name: 'Keterangan / Catatan',
    category: 'note',
    icon: 'FileText',
    defaultX: 10,
    defaultY: 82,
    annotation: {
      text: 'Catatan: Dokumen ini telah diverifikasi dan disetujui.',
      fontSize: 16,
      fontFamily: 'Plus Jakarta Sans',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      color: '#1e293b',
      backgroundColor: '#fef08a',
      backgroundOpacity: 0.9,
      borderColor: '#eab308',
      borderWidth: 2,
      borderRadius: 8,
      textAlign: 'left',
      padding: 12,
      rotation: 0,
      opacity: 1,
    },
  },
  {
    name: 'Cap / Stempel LUNAS',
    category: 'stamp',
    icon: 'CheckCircle2',
    defaultX: 65,
    defaultY: 65,
    annotation: {
      text: 'VERIFIED / LUNAS\nTgl: 29/09/2026',
      fontSize: 22,
      fontFamily: 'Plus Jakarta Sans',
      fontWeight: '800',
      fontStyle: 'normal',
      textDecoration: 'none',
      color: '#16a34a',
      backgroundColor: '#f0fdf4',
      backgroundOpacity: 0.85,
      borderColor: '#16a34a',
      borderWidth: 3,
      borderRadius: 12,
      textAlign: 'center',
      padding: 14,
      rotation: -8,
      opacity: 0.95,
    },
  },
  {
    name: 'Tanda Tangan & Nama',
    category: 'signature',
    icon: 'PenTool',
    defaultX: 60,
    defaultY: 75,
    annotation: {
      text: 'Mengetahui,\nPenanggung Jawab\n\n\n\n( Drs. Ahmad Subarjo, M.Pd )\nNIP. 19780512 200501 1 003',
      fontSize: 14,
      fontFamily: 'Plus Jakarta Sans',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      color: '#0f172a',
      backgroundColor: 'transparent',
      backgroundOpacity: 0,
      borderColor: 'transparent',
      borderWidth: 0,
      borderRadius: 0,
      textAlign: 'center',
      padding: 8,
      rotation: 0,
      opacity: 1,
    },
  },
  {
    name: 'Nomor Registrasi / Kode',
    category: 'label',
    icon: 'Hash',
    defaultX: 65,
    defaultY: 8,
    annotation: {
      text: 'REG-NO: 2026/DOC/IX-8842',
      fontSize: 15,
      fontFamily: 'JetBrains Mono',
      fontWeight: '600',
      fontStyle: 'normal',
      textDecoration: 'none',
      color: '#4338ca',
      backgroundColor: '#eef2ff',
      backgroundOpacity: 0.95,
      borderColor: '#818cf8',
      borderWidth: 1.5,
      borderRadius: 6,
      textAlign: 'center',
      padding: 8,
      rotation: 0,
      opacity: 1,
    },
  },
  {
    name: 'Watermark RAHASIA / DRAFT',
    category: 'watermark',
    icon: 'ShieldAlert',
    defaultX: 20,
    defaultY: 40,
    annotation: {
      text: 'DRAFT / RAHASIA',
      fontSize: 48,
      fontFamily: 'Plus Jakarta Sans',
      fontWeight: '800',
      fontStyle: 'normal',
      textDecoration: 'none',
      color: '#ef4444',
      backgroundColor: 'transparent',
      backgroundOpacity: 0,
      borderColor: '#ef4444',
      borderWidth: 3,
      borderRadius: 16,
      textAlign: 'center',
      padding: 20,
      rotation: -30,
      opacity: 0.28,
    },
  },
  {
    name: 'Label Badge Penting',
    category: 'label',
    icon: 'Tag',
    defaultX: 8,
    defaultY: 8,
    annotation: {
      text: '★ LAMPIRAN RESMI ★',
      fontSize: 13,
      fontFamily: 'Plus Jakarta Sans',
      fontWeight: 'bold',
      fontStyle: 'normal',
      textDecoration: 'none',
      color: '#ffffff',
      backgroundColor: '#dc2626',
      backgroundOpacity: 1,
      borderColor: '#b91c1c',
      borderWidth: 1,
      borderRadius: 20,
      textAlign: 'center',
      padding: 6,
      rotation: 0,
      opacity: 1,
    },
  },
];

/**
 * Generates sample document images so the user can test the app immediately
 */
export function generateSamplePages(): Promise<import('../types').ImagePage[]> {
  return new Promise((resolve) => {
    // Generate a sleek sample certificate / document page canvas
    const samplePages: import('../types').ImagePage[] = [];

    // Page 1: Lembar Dokumen / Surat
    const canvas1 = document.createElement('canvas');
    canvas1.width = 1200;
    canvas1.height = 1600;
    const ctx1 = canvas1.getContext('2d')!;

    // Background paper
    ctx1.fillStyle = '#f8fafc';
    ctx1.fillRect(0, 0, 1200, 1600);

    // Document header border
    ctx1.fillStyle = '#1e3a8a';
    ctx1.fillRect(80, 80, 1040, 12);
    ctx1.fillStyle = '#3b82f6';
    ctx1.fillRect(80, 96, 1040, 4);

    // Header text simulation
    ctx1.fillStyle = '#0f172a';
    ctx1.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx1.textAlign = 'center';
    ctx1.fillText('LEMBAR KEGIATAN & VERIFIKASI DOKUMEN', 600, 170);

    ctx1.font = '18px "Plus Jakarta Sans", sans-serif';
    ctx1.fillStyle = '#475569';
    ctx1.fillText('MGMP IPA / PENDIDIKAN DAN KEBUDAYAAN', 600, 210);
    ctx1.fillText('Tahun Ajaran 2026 / 2027 • Dokumen Administrasi Pembelajaran', 600, 240);

    ctx1.strokeStyle = '#cbd5e1';
    ctx1.lineWidth = 2;
    ctx1.beginPath();
    ctx1.moveTo(80, 270);
    ctx1.lineTo(1120, 270);
    ctx1.stroke();

    // Document mock content
    ctx1.textAlign = 'left';
    ctx1.fillStyle = '#334155';
    ctx1.font = '20px "Plus Jakarta Sans", sans-serif';

    const sampleLines = [
      'Bersama ini dilampirkan berkas hasil evaluasi kegiatan pembelajaran kurikulum.',
      'Harap periksa kelengkapan data berikut sebelum dilakukan pengesahan:',
      '',
      '1. Nama Pelaksana Kegiatan       : ............................................................................',
      '2. Unit / Instansi Asal         : ............................................................................',
      '3. Tanggal Pelaksanaan          : ............................................................................',
      '4. Status Penilaian / Catatan   : [ Tempat Menambahkan Keterangan ]',
    ];

    sampleLines.forEach((text, idx) => {
      ctx1.fillText(text, 100, 340 + idx * 46);
    });

    // Mock table
    ctx1.fillStyle = '#e2e8f0';
    ctx1.fillRect(100, 600, 1000, 50);
    ctx1.strokeStyle = '#94a3b8';
    ctx1.strokeRect(100, 600, 1000, 350);

    ctx1.fillStyle = '#1e293b';
    ctx1.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
    ctx1.fillText('No', 130, 632);
    ctx1.fillText('Uraian Komponen', 220, 632);
    ctx1.fillText('Target', 680, 632);
    ctx1.fillText('Keterangan / Posisi Tambahan Teks', 840, 632);

    ctx1.font = '16px "Plus Jakarta Sans", sans-serif';
    ctx1.fillStyle = '#475569';
    const rows = [
      ['1', 'Perencanaan RPP / Modul Ajar', '100%', 'Lengkap'],
      ['2', 'Media Pembelajaran & Praktikum', '95%', 'Sesuai Standar'],
      ['3', 'Instrumen Asesmen Formatif & Sumatif', '100%', 'Tervalidasi'],
      ['4', 'Refleksi dan Laporan Kinerja Guru', '90%', 'Disetujui'],
    ];

    rows.forEach((row, rIdx) => {
      const rowY = 690 + rIdx * 65;
      ctx1.fillText(row[0], 135, rowY);
      ctx1.fillText(row[1], 220, rowY);
      ctx1.fillText(row[2], 700, rowY);
      ctx1.fillText(row[3], 860, rowY);
      ctx1.beginPath();
      ctx1.moveTo(100, rowY + 25);
      ctx1.lineTo(1100, rowY + 25);
      ctx1.strokeStyle = '#e2e8f0';
      ctx1.stroke();
    });

    // Bottom signatures placeholder
    ctx1.strokeStyle = '#cbd5e1';
    ctx1.setLineDash([6, 6]);
    ctx1.strokeRect(700, 1150, 400, 240);
    ctx1.setLineDash([]);
    ctx1.fillStyle = '#94a3b8';
    ctx1.font = 'italic 16px "Plus Jakarta Sans", sans-serif';
    ctx1.textAlign = 'center';
    ctx1.fillText('Area Tempat Penempatan Teks & Tanda Tangan', 900, 1270);

    samplePages.push({
      id: 'sample_page_1',
      title: 'Contoh Lembar Verifikasi - Hal 1',
      originalFileName: 'Lembar_Verifikasi_Dokumen.png',
      dataUrl: canvas1.toDataURL('image/jpeg', 0.9),
      naturalWidth: 1200,
      naturalHeight: 1600,
      annotations: [
        {
          id: 'ann_demo_1',
          text: 'NO: 088/MGMP-IPA/IX/2026',
          x: 68,
          y: 7.2,
          fontSize: 16,
          fontFamily: 'JetBrains Mono',
          fontWeight: '600',
          fontStyle: 'normal',
          textDecoration: 'none',
          color: '#1e3a8a',
          backgroundColor: '#eff6ff',
          backgroundOpacity: 0.95,
          borderColor: '#93c5fd',
          borderWidth: 1.5,
          borderRadius: 6,
          textAlign: 'center',
          padding: 8,
          rotation: 0,
          opacity: 1,
        },
        {
          id: 'ann_demo_2',
          text: 'Keterangan Tambahan:\nBerkas ini sah dan telah diperiksa pada rapat kerja.',
          x: 9,
          y: 68,
          fontSize: 16,
          fontFamily: 'Plus Jakarta Sans',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          color: '#14532d',
          backgroundColor: '#dcfce7',
          backgroundOpacity: 0.95,
          borderColor: '#86efac',
          borderWidth: 2,
          borderRadius: 8,
          textAlign: 'left',
          padding: 12,
          rotation: 0,
          opacity: 1,
        },
      ],
    });

    // Page 2: Sertifikat / Lembar Lampiran
    const canvas2 = document.createElement('canvas');
    canvas2.width = 1200;
    canvas2.height = 1600;
    const ctx2 = canvas2.getContext('2d')!;

    ctx2.fillStyle = '#f8fafc';
    ctx2.fillRect(0, 0, 1200, 1600);

    ctx2.fillStyle = '#047857';
    ctx2.fillRect(80, 80, 1040, 12);
    ctx2.fillStyle = '#10b981';
    ctx2.fillRect(80, 96, 1040, 4);

    ctx2.fillStyle = '#0f172a';
    ctx2.font = 'bold 34px "Plus Jakarta Sans", sans-serif';
    ctx2.textAlign = 'center';
    ctx2.fillText('LAMPIRAN DATA & BUKTI FISIK', 600, 170);

    ctx2.font = '18px "Plus Jakarta Sans", sans-serif';
    ctx2.fillStyle = '#475569';
    ctx2.fillText('Halaman 2 • Dokumentasi Lampiran Gambar & Evaluasi', 600, 210);

    ctx2.strokeStyle = '#cbd5e1';
    ctx2.lineWidth = 2;
    ctx2.beginPath();
    ctx2.moveTo(80, 250);
    ctx2.lineTo(1120, 250);
    ctx2.stroke();

    // Box simulation for photos/graphs
    ctx2.fillStyle = '#f1f5f9';
    ctx2.fillRect(100, 300, 1000, 500);
    ctx2.strokeStyle = '#94a3b8';
    ctx2.strokeRect(100, 300, 1000, 500);

    ctx2.fillStyle = '#64748b';
    ctx2.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
    ctx2.fillText('[ Area Pratinjau Foto Dokumentasi / Grafik Kegiatan ]', 600, 550);

    samplePages.push({
      id: 'sample_page_2',
      title: 'Contoh Lampiran Fisik - Hal 2',
      originalFileName: 'Lampiran_Dokumentasi_Hal2.png',
      dataUrl: canvas2.toDataURL('image/jpeg', 0.9),
      naturalWidth: 1200,
      naturalHeight: 1600,
      annotations: [
        {
          id: 'ann_demo_3',
          text: 'TERVALIDASI RESMI',
          x: 62,
          y: 72,
          fontSize: 24,
          fontFamily: 'Plus Jakarta Sans',
          fontWeight: '800',
          fontStyle: 'normal',
          textDecoration: 'none',
          color: '#047857',
          backgroundColor: '#ecfdf5',
          backgroundOpacity: 0.9,
          borderColor: '#10b981',
          borderWidth: 3,
          borderRadius: 10,
          textAlign: 'center',
          padding: 12,
          rotation: -5,
          opacity: 0.95,
        },
      ],
    });

    resolve(samplePages);
  });
}
