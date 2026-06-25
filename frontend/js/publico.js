document.addEventListener("DOMContentLoaded", function () {
    // 1. Pega o ID do link (ex: publico.html?id=1)
    const urlParams = new URLSearchParams(window.location.search);
    const idInfo = urlParams.get('id');
    const msgErro = document.getElementById('mensagemErro');

    // Se o link não tiver ID, mostra erro
    if (!idInfo) {
        document.getElementById('telaSenha').innerHTML = "<div class='alert alert-danger text-center fw-bold'>Link inválido. Escaneie o QR Code novamente.</div>";
        return;
    }

    // 2. Quando o botão "Acessar" é clicado
    document.getElementById('btnAcessar').addEventListener('click', async function() {
        const senhaDigitada = document.getElementById('inputSenha').value.trim();

        if(!senhaDigitada) {
            msgErro.textContent = "Por favor, digite a senha do crachá.";
            msgErro.classList.remove('d-none');
            return;
        }

        try {
            // 3. Envia a senha para o servidor verificar
            const resposta = await fetch(`/api/publico/${idInfo}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ senhaDigitada })
            });

            if (resposta.ok) {
                const dados = await resposta.json();
                
                // 4. SUCESSO! Esconde a tela de senha e mostra a ficha pronta
                document.getElementById('telaSenha').classList.add('d-none');
                document.getElementById('telaDados').classList.remove('d-none');

                // Formatar data
                let dataNasc = dados.data_nascimento || 'Não informado';
                if(dataNasc !== 'Não informado' && dataNasc.includes('-')) {
                    const partes = dataNasc.split('-');
                    if(partes.length === 3) dataNasc = `${partes[2]}/${partes[1]}/${partes[0]}`;
                }
                
                let sexo = 'Não informado';
                if(dados.sexo === 'M') sexo = 'Masculino';
                if(dados.sexo === 'F') sexo = 'Feminino';

                // 5. Preenche os dados na tela
                document.getElementById('pubNome').textContent = `${dados.nome} ${dados.sobrenome}`;
                document.getElementById('pubDataNascimento').textContent = dataNasc;
                document.getElementById('pubSexo').textContent = sexo;
                document.getElementById('pubTipoSanguineo').textContent = dados.tipo_sanguineo || 'Não informado';
                document.getElementById('pubAlergias').textContent = dados.alergias || 'Nenhuma';
                document.getElementById('pubMedicamentos').textContent = dados.medicamentos || 'Nenhum';
                document.getElementById('pubDoencas').textContent = dados.doencas || 'Nenhuma';
                document.getElementById('pubCirurgias').textContent = dados.cirurgias || 'Nenhuma';
                
                document.getElementById('pubContatoNome').textContent = dados.nome_contato || 'Não informado';
                document.getElementById('pubContatoTelefone').textContent = dados.telefone || 'Não informado';

                // Esconde a mensagem de erro
                msgErro.classList.add('d-none');

            } else if (resposta.status === 401) {
                msgErro.textContent = "Senha incorreta. Verifique o crachá e tente novamente.";
                msgErro.classList.remove('d-none');
            } else {
                msgErro.textContent = "Ficha cadastrada não encontrada.";
                msgErro.classList.remove('d-none');
            }
        } catch (error) {
            console.error("Erro na requisição:", error);
            msgErro.textContent = "Erro de conexão com o servidor. Tente novamente.";
            msgErro.classList.remove('d-none');
        }
    });
});