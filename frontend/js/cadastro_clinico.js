document.addEventListener("DOMContentLoaded", function () {
    const validator = new window.JustValidate('#clinicoForm', { validateBeforeSubmitting: true });

    validator
        .addField('#nome', [{ rule: 'required', errorMessage: 'Nome obrigatório' }])
        .addField('#cpf', [{ rule: 'required', errorMessage: 'CPF obrigatório' }])
        .addField('#senhaPublica', [{ rule: 'required', errorMessage: 'A senha pública é obrigatória' }])
        .onSuccess((event) => {
            event.preventDefault();
            alert("Dados salvos com sucesso! Redirecionando para o seu perfil...");
            window.location.href = "perfil.html"; 
        });
});