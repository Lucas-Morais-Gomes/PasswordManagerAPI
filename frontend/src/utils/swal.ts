import Swal from 'sweetalert2';

export const mySwal = Swal.mixin({
    background: '#2a2a2a',
    color: '#ffffff',
    confirmButtonColor: '#646cff',
    cancelButtonColor: '#dc3545',
    customClass: {
        popup: 'swal-custom-border'
    }
});