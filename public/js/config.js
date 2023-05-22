$(document).ready(function () {
  $(".dropdown-toggle").dropdown();
  // Adiciona o evento click nos itens do menu suspenso
  $(".dropdown-item").on("click", function () {
    var option = $(this).text(); // obtém o texto da opção selecionada
    if (option == "Acompanhamento - PH") {
      // verifica a opção selecionada
      $("#iotChart").show(); // mostra o gráfico
      $("#boxes").hide();
    } else if(option == "Leituras em Tempo Real") {
        $("#iotChart").hide(); // mostra o gráfico
      $("#boxes").show();
    }
    else if(option == "Relatórios") {
        $("#iotChart").hide(); // mostra o gráfico
        $("#boxes").hide();
    } 
    else {
      $("#iotChart").hide();
      $("#boxes").hide(); // oculta o gráfico
    }
  });
});
