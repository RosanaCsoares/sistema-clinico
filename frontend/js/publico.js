document.addEventListener("DOMContentLoaded", function () {
    const btnAcessar = document.getElementById("btnAcessarFicha");
    const inputSenha = document.getElementById("inputSenhaPublica");
    const secaoSenha = document.getElementById("secaoSenha");
    const secaoFicha = document.getElementById("secaoFicha");

    btnAcessar.addEventListener("click", function() {
        if (inputSenha.value.trim() !== "") {
            secaoSenha.classList.add("hidden");
            secaoFicha.classList.remove("hidden");
        } else {
            alert("Por favor, insira a senha pública.");
        }
    });
});