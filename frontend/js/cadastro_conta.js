document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById('contaForm');

    form.addEventListener('submit', function (event) {
        event.preventDefault(); // Impede a página de recarregar

        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;
        const confirmaSenha = document.getElementById('confirmaSenha').value;

        if (!email || !senha) {
            alert("⚠️ Por favor, preencha o e-mail e a senha.");
            return;
        }

        if (senha !== confirmaSenha) {
            alert("⚠️ As senhas não coincidem. Tente novamente.");
            return;
        }

        // Salva temporariamente para enviar junto com a ficha clínica
        sessionStorage.setItem('tempEmail', email);
        sessionStorage.setItem('tempSenha', senha);
        
        // Vai para a tela de dados clínicos
        window.location.href = "cadastro_clinico.html"; 
    });
});