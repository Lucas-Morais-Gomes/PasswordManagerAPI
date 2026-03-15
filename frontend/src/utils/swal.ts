import Swal from 'sweetalert2';

export const mySwal = Swal.mixin({
    background: 'rgba(30, 41, 59, 0.95)',
    color: '#ffffff',
    backdrop: 'rgba(0, 0, 0, 0.6)',
    confirmButtonColor: '#6366f1',
    cancelButtonColor: 'rgba(239, 68, 68, 0.8)',
    customClass: {
        popup: 'border border-white/10 rounded-2xl shadow-2xl backdrop-blur-md',
        confirmButton: 'rounded-xl px-6 py-2 shadow-lg shadow-indigo-500/20',
        cancelButton: 'rounded-xl px-6 py-2 border border-red-500/20'
    }
});