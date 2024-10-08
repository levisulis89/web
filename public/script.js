$(document).ready(function () {
    // Regisztráció
    $('#registerSubmit').on('click', function (e) {
        e.preventDefault(); // Alapértelmezett űrlapküldés letiltása

        const name = $('input[name="name"]').val();
        const email = $('input[name="email"]').val();
        const password = $('input[name="password"]').val();

        let valid = true;

        // Ellenőrizzük a mezők érvényességét
        if (!name) {
            $('input[name="name"]').siblings('small.errorReq').show();
            valid = false;
        } else {
            $('input[name="name"]').siblings('small.errorReq').hide();
        }

        if (!email) {
            $('input[name="email"]').siblings('small.errorReq').show();
            valid = false;
        } else {
            $('input[name="email"]').siblings('small.errorReq').hide();
        }

        if (!password) {
            $('input[name="password"]').siblings('small.errorMinLength').show();
            valid = false;
        } else {
            $('input[name="password"]').siblings('small.errorMinLength').hide();
        }

        if (valid) {
            // Regisztráció AJAX
            $.ajax({
                url: '/register',
                method: 'POST',
                data: { name: name, email: email, password: password },
                success: function (response) {
                    alert('Sikeres regisztráció!'); // Sikeres regisztráció esetén
                    window.location.href = '/login'; // Irányítás a bejelentkezéshez
                },
                error: function (xhr) {
                    alert('Regisztráció nem sikerült: ' + xhr.responseText); // Részletes hibaüzenet
                }
            });
        }
    });

    // Bejelentkezés
    $('#loginSubmit').on('click', function (e) {
        e.preventDefault(); // Alapértelmezett űrlapküldés letiltása

        const email = $('input[name="email"]').val();
        const password = $('input[name="password"]').val();

        if (!email || !password) {
            alert('Minden mezőt ki kell tölteni!'); // Ellenőrzés
            return;
        }

        $.ajax({
            url: '/login',
            method: 'POST',
            data: { email, password },
            success: function (response) {
                alert(response.message); // Sikeres bejelentkezés esetén
                if (response.success) {
                    window.location.href = '/jatek.html'; // Irány a játék oldal
                }
            },
            error: function () {
                alert('Hiba történt a bejelentkezés során.'); // Részletes hibaüzenet
            }
        });
    });
});
