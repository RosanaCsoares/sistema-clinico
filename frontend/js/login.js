document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById('loginForm');

    form.addEventListener('submit', async function (event) {
        event.preventDefault(); // Impede a página de recarregar

        // Capta os dados digitados
        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha').value;

        // Validação simples
        if (!email || !senha) {
            alert("Por favor, preencha o e-mail e a senha para entrar.");
            return;
        }

        try {
            // Envia o pedido de login para o servidor Node.js
            const resposta = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, senha: senha })
            });

            const resultado = await resposta.json();

            // Verifica a resposta do servidor
            if (resposta.ok) {
                // Guarda o seu ID no navegador para saber quem você é
                localStorage.setItem('usuarioLogadoId', resultado.idUsuario);
                
                // Redireciona para o Perfil
                window.location.href = "perfil.html"; 
            } else {
                // Se errar a senha, mostra o erro que o Backend enviou
                alert("Aviso: " + resultado.erro);
            }
        } catch (erro) {
            console.error("Erro no login:", erro);
            alert("Erro de comunicação com o servidor! Verifique se está a aceder pelo link http://localhost:3000 e se o terminal do VS Code está a correr.");
        }
    });
});