document.addEventListener("DOMContentLoaded", async function () {
    const idUsuario = localStorage.getItem('usuarioLogadoId');
    
    if (!idUsuario) {
        window.location.href = "index.html";
        return;
    }

    async function carregarDados() {
        try {
            const resposta = await fetch(`/api/perfil/${idUsuario}`);
            if (resposta.ok) {
                const dados = await resposta.json();

                // 1. Exibir Dados na Tela Principal
                document.getElementById('displayNome').textContent = `${dados.nome} ${dados.sobrenome}`;
                document.getElementById('displayCpf').textContent = dados.cpf || 'Não informado';
                document.getElementById('displayRg').textContent = dados.rg || 'Não informado';
                
                let dataNasc = dados.data_nascimento || 'Não informado';
                if(dataNasc !== 'Não informado') {
                    const partes = dataNasc.split('-');
                    if(partes.length === 3) dataNasc = `${partes[2]}/${partes[1]}/${partes[0]}`;
                }
                document.getElementById('displayDataNascimento').textContent = dataNasc;
                
                let sexo = 'Não informado';
                if(dados.sexo === 'M') sexo = 'Masculino';
                if(dados.sexo === 'F') sexo = 'Feminino';
                document.getElementById('displaySexo').textContent = sexo;

                document.getElementById('displayTipoSanguineo').textContent = dados.tipo_sanguineo || 'Não informado';
                document.getElementById('displayAlergias').textContent = dados.alergias || 'Nenhuma';
                document.getElementById('displayMedicamentos').textContent = dados.medicamentos || 'Nenhum';
                document.getElementById('displayDoencas').textContent = dados.doencas || 'Nenhuma';
                document.getElementById('displayCirurgias').textContent = dados.cirurgias || 'Nenhuma';

                document.getElementById('displayContatoNome').textContent = dados.nome_contato;
                document.getElementById('displayContatoTelefone').textContent = dados.telefone;
                document.getElementById('displayContatoEmail').textContent = dados.email_contato || 'Não informado';
                document.getElementById('displaySenhaPublica').textContent = dados.senha_publica;

                // 2. Preencher o Formulário Modal de Edição
                document.getElementById('editNome').value = dados.nome || '';
                document.getElementById('editSobrenome').value = dados.sobrenome || '';
                document.getElementById('editCpf').value = dados.cpf || '';
                document.getElementById('editRg').value = dados.rg || '';
                document.getElementById('editDataNascimento').value = dados.data_nascimento || '';
                document.getElementById('editSexo').value = dados.sexo || '';
                
                document.getElementById('editTipoSanguineo').value = dados.tipo_sanguineo || '';
                document.getElementById('editAlergias').value = dados.alergias || '';
                document.getElementById('editMedicamentos').value = dados.medicamentos || '';
                document.getElementById('editDoencas').value = dados.doencas || '';
                document.getElementById('editCirurgias').value = dados.cirurgias || '';
                
                document.getElementById('editContatoNome').value = dados.nome_contato || '';
                document.getElementById('editContatoTelefone').value = dados.telefone || '';
                document.getElementById('editContatoEmail').value = dados.email_contato || '';
                document.getElementById('editSenhaPublica').value = dados.senha_publica || '';

                // GERAR QR CODE
                const qrcodeContainer = document.getElementById("qrcode-container");
                qrcodeContainer.innerHTML = ""; 
                const linkPublico = `http://localhost:3000/publico.html?id=${dados.id_info}`;
                
                new QRCode(qrcodeContainer, {
                    text: linkPublico, width: 150, height: 150, colorDark : "#000000", colorLight : "#ffffff"
                });

                document.getElementById("btnCompartilhar").onclick = function() {
                    navigator.clipboard.writeText(linkPublico);
                    alert("Link copiado para a área de transferência!");
                };
            }
        } catch (error) {
            console.error("Erro ao carregar os dados:", error);
        }
    }

    await carregarDados();

    // 3. ENVIAR DADOS EDITADOS
    const btnSalvar = document.getElementById("btnSalvarEdicao");
    if (btnSalvar) {
        btnSalvar.addEventListener("click", async function() {
            const dadosAtualizados = {
                nome: document.getElementById('editNome').value,
                sobrenome: document.getElementById('editSobrenome').value,
                cpf: document.getElementById('editCpf').value,
                rg: document.getElementById('editRg').value,
                dataNascimento: document.getElementById('editDataNascimento').value,
                sexo: document.getElementById('editSexo').value,
                tipoSanguineo: document.getElementById('editTipoSanguineo').value,
                alergias: document.getElementById('editAlergias').value,
                medicamentos: document.getElementById('editMedicamentos').value,
                doencas: document.getElementById('editDoencas').value,
                cirurgias: document.getElementById('editCirurgias').value,
                nomeContato: document.getElementById('editContatoNome').value,
                telefoneContato: document.getElementById('editContatoTelefone').value,
                emailContato: document.getElementById('editContatoEmail').value,
                senhaPublica: document.getElementById('editSenhaPublica').value
            };

            try {
                const resposta = await fetch(`/api/perfil/${idUsuario}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(dadosAtualizados)
                });

                if (resposta.ok) {
                    alert("✅ Cadastro atualizado com sucesso!");
                    const modalElement = document.getElementById('modalEditar');
                    const modal = bootstrap.Modal.getInstance(modalElement);
                    modal.hide();
                    await carregarDados(); // Recarrega os dados na tela principal
                } else {
                    alert("Erro ao atualizar dados.");
                }
            } catch (error) {
                console.error(error);
                alert("Erro de comunicação com o servidor.");
            }
        });
    }

    // 4. APAGAR CADASTRO COMPLETO (ATUALIZADO)
    document.getElementById("btnApagarConta").addEventListener("click", async function() {
        if(confirm("Tem certeza que deseja apagar todo o seu cadastro? Esta ação é irreversível.")) {
            try {
                const resposta = await fetch(`/api/perfil/${idUsuario}`, {
                    method: 'DELETE'
                });

                if (resposta.ok) {
                    alert("Cadastro apagado com sucesso.");
                    fazerLogout();
                } else {
                    const resultado = await resposta.json();
                    alert("Erro ao apagar cadastro: " + (resultado.erro || "Tente novamente."));
                }
            } catch (error) {
                console.error("Erro de comunicação com o servidor:", error);
                alert("Erro de comunicação com o servidor ao tentar apagar a conta.");
            }
        }
    });

    document.getElementById("btnImprimirCracha").addEventListener("click", function() {
        const qrcodeContainer = document.getElementById("qrcode-container");
        const canvas = qrcodeContainer.querySelector("canvas");
        const senhaPublica = document.getElementById("displaySenhaPublica").textContent;

        if (canvas) {
            const imgData = canvas.toDataURL("image/png");
            
            const janelaImpressao = window.open('', '', 'width=600,height=600');
            janelaImpressao.document.write(`
                <html>
                <head>
                    <title>Imprimir QR Code</title>
                    <style>
                        body { font-family: Arial, sans-serif; text-align: center; padding: 20px; margin: 0; }
                        .container { display: inline-block; text-align: center; }
                        img { width: 150px; height: 150px; display: block; margin: 0 auto; }
                        .senha { font-size: 24px; font-weight: bold; color: #000; margin-top: 10px; letter-spacing: 2px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <img src="${imgData}" alt="QR Code">
                        <div class="senha">${senhaPublica}</div>
                    </div>
                    <script>
                        window.onload = function() {
                            window.print();
                            window.close();
                        };
                    </script>
                </body>
                </html>
            `);
            janelaImpressao.document.close();
        } else {
            alert("Erro: O QR Code ainda não foi gerado.");
        }
    });
});

function fazerLogout() {
    localStorage.removeItem('usuarioLogadoId');
    window.location.href = "index.html";
}