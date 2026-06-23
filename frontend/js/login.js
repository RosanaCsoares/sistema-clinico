JavaScript
document.addEventListener("DOMContentLoaded", function () {
    const validator = new window.JustValidate('#loginForm', { validateBeforeSubmitting: true });

    validator
        .addField('#email', [{ rule: 'required', errorMessage: 'O e-mail é obrigatório.' }, { rule: 'email', errorMessage: 'E-mail inválido.' }])
        .addField('#senha', [{ rule: 'required', errorMessage: 'A senha é obrigatória.' }])
        .onSuccess((event) => {
            event.preventDefault();
            alert("Login simulado com sucesso!");
            window.location.href = "perfil.html"; 
        });
});