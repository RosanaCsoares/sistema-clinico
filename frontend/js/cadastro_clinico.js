document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById('clinicoForm');

    form.addEventListener('submit', async function (event) {
        event.preventDefault(); // Impede a página de recarregar

        // Pega o e-mail e a senha da tela anterior
        const email = sessionStorage.getItem('tempEmail');
        const senha = sessionStorage.getItem('tempSenha');

        if (!email || !senha) {
            alert("Ops! O e-mail e a senha não foram recebidos. Por favor, volte ao início e tente novamente.");
            return;
        }

        // Junta tudo num pacote só
        const dados = {
            email: email,
            senha: senha,
            nome: document.getElementById('nome').value,
            sobrenome: document.getElementById('sobrenome').value,
            rg: document.getElementById('rg').value,
            cpf: document.getElementById('cpf').value,
            dataNascimento: document.getElementById('dataNascimento').value,
            sexo: document.getElementById('sexo').value,
            tipoSanguineo: document.getElementById('tipoSanguineo').value,
            alergias: document.getElementById('alergias').value,
            medicamentos: document.getElementById('medicamentos').value,
            doencas: document.getElementById('doencas').value,
            cirurgias: document.getElementById('cirurgias').value,
            contatoNome: document.getElementById('contatoNome').value,
            contatoTelefone: document.getElementById('contatoTelefone').value,
            contatoEmail: document.getElementById('contatoEmail').value,
            senhaPublica: document.getElementById('senhaPublica').value
        };

        try {
            // Envia para o nosso servidor Node.js
            const resposta = await fetch('/api/cadastro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });

            if (resposta.ok) {
                // SUCESSO!
                alert("✅ Cadastro realizado com sucesso no Banco de Dados! Agora você já pode fazer o login.");
                sessionStorage.clear(); // Limpa a memória
                window.location.href = "index.html"; 
            } else {
                // SE O BANCO DE DADOS RECUSAR (Ex: CPF já existe)
                const erro = await resposta.json();
                alert("⚠️ O servidor avisou: " + erro.erro);
            }
        } catch (erro) {
            console.error(erro);
            alert("❌ Erro de conexão! Verifique se o servidor Node.js está rodando no terminal do VS Code.");
        }
    });
});