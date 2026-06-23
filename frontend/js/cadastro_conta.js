document.addEventListener("DOMContentLoaded", function () {
    const validator = new window.JustValidate('#contaForm', { validateBeforeSubmitting: true });

    validator
        .addField('#email', [{ rule: 'required', errorMessage: 'E-mail é obrigatório' }, { rule: 'email', errorMessage: 'E-mail inválido' }])
        .addField('#senha', [{ rule: 'required', errorMessage: 'Senha é obrigatória' }])
        .addField('#confirmaSenha', [
            { rule: 'required', errorMessage: 'Confirmação é obrigatória' },
            {
                validator: (value, fields) => { return value === fields['#senha'].elem.value; },
                errorMessage: 'As senhas não coincidem',
            }
        ])
        .onSuccess((event) => {
            event.preventDefault();
            window.location.href = "cadastro_clinico.html"; 
        });
});