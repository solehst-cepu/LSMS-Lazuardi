import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DataTable, Column } from '../common/DataTable';
import { ConfirmModal } from '../common/ConfirmModal';
import { AuditLog } from '../../types';
import { History, Shield, Trash2, AlertOctagon } from 'lucide-react';

export const AuditLogComponent: React.FC = () => {
  const { auditLogs, deleteAuditLog, clearAllAuditLogs, currentUser } = useApp();
  const [logToDelete, setLogToDelete] = useState<AuditLog | null>(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);

  const columns: Column<AuditLog>[] = [
    {
      header: 'Waktu Timestamp',
      key: 'timestamp',
      accessor: (a) => <span className="font-mono text-xs font-bold text-slate-800">{a.timestamp}</span>,
    },
    {
      header: 'User & Role',
      key: 'userName',
      accessor: (a) => (
        <div>
          <span className="font-bold text-slate-900 block text-xs">{a.userName}</span>
          <span className="text-[10px] text-blue-700 font-semibold">{a.userRole}</span>
        </div>
      ),
    },
    {
      header: 'Aksi & Modul',
      key: 'action',
      accessor: (a) => (
        <div>
          <span className="px-2 py-0.5 bg-blue-50 text-blue-800 font-bold rounded text-[10px] border border-blue-200 block w-max">
            {a.action}
          </span>
          <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">{a.module}</span>
        </div>
      ),
    },
    {
      header: 'Detail Aktivitas',
      key: 'details',
      accessor: (a) => <p className="text-xs text-slate-700 line-clamp-2">{a.details}</p>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-700" />
            <span>Audit Log & Traceability System LSMS</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Jejak rekam aktivitas transaksi user, pembuatan data, dan pengubahan status keamanan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> Immutable Audit Trail
          </span>

          {currentUser.role === 'Administrator' && auditLogs.length > 0 && (
            <button
              onClick={() => setShowClearAllModal(true)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Bersihkan Semua Log Audit"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Hapus Semua Log</span>
            </button>
          )}
        </div>
      </div>

      <DataTable
        title="Audit Log System LSMS"
        data={auditLogs}
        columns={columns}
        searchPlaceholder="Cari user, aksi, modul, atau detail..."
        exportFilename="Audit_Log_LSMS"
        actions={(row) => (
          <button
            onClick={() => setLogToDelete(row)}
            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Hapus Audit Log"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      />

      <ConfirmModal
        isOpen={!!logToDelete}
        onClose={() => setLogToDelete(null)}
        onConfirm={() => {
          if (logToDelete) {
            deleteAuditLog(logToDelete.id);
            setLogToDelete(null);
          }
        }}
        title="Hapus Audit Log"
        message={`Apakah Anda yakin ingin menghapus catatan audit log "${logToDelete?.action}" (${logToDelete?.timestamp})?`}
      />

      <ConfirmModal
        isOpen={showClearAllModal}
        onClose={() => setShowClearAllModal(false)}
        onConfirm={() => {
          clearAllAuditLogs();
          setShowClearAllModal(false);
        }}
        title="Kosongkan Seluruh Audit Log"
        message="APAKAH ANDA YAKIN INGIN MENGHAPUS SELURUH RIWAYAT AUDIT LOG SISTEM? Tindakan ini tidak dapat dibatalkan!"
        confirmText="Ya, Bersihkan Semua"
      />
    </div>
  );
};
