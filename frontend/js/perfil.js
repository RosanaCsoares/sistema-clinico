document.addEventListener("DOMContentLoaded", function () {
    const linkPublico = "http://localhost:3000/publico.html?id=123";

    new QRCode(document.getElementById("qrcode-container"), {
        text: linkPublico,
        width: 150,
        height: 150,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });

    document.getElementById("btnApagarConta").addEventListener("click", function() {
        if(confirm("Tem certeza que deseja apagar todo o seu cadastro? O link público ficará indisponível imediatamente.")) {
            alert("Cadastro apagado com sucesso.");
            window.location.href = "index.html";
        }
    });

    document.getElementById("btnCompartilhar").addEventListener("click", function() {
        navigator.clipboard.writeText(linkPublico);
        alert("Link copiado para a área de transferência!");
    });
});