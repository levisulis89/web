// Bejelentkezési kód
$('#loginSubmit').on('click', function (e) {
    e.preventDefault();
    const email = $('input[name="email"]').val();
    const password = $('input[name="password"]').val();

    if (!email || !password) {
        alert('Minden mezőt ki kell tölteni!');
        return;
    }

    $.ajax({
        url: '/login',
        method: 'POST',
        data: { email, password },
        success: function (response) {
            if (response.success) {
                alert(response.message);
                window.location.href = '/jatek.html'; // Irány a játék oldal
            } else {
                alert('Hibás email vagy jelszó!');
            }
        },
        error: function () {
            alert('Hiba történt a bejelentkezés során.');
        }
    });
});
