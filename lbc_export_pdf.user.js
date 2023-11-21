// ==UserScript==
// @name         LittleBigConnectionExportPDF
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Ajoute une fonctionnalité d'export PDF à la page de détail d'un AO
// @author       mdel ndem
// @match        https://www.littlebigconnection.com/request-for-proposal/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @require https://code.jquery.com/jquery-latest.min.js
// @require https://unpkg.com/jspdf@latest/dist/jspdf.umd.min.js
// @require https://html2canvas.hertzen.com/dist/html2canvas.min.js
// ==/UserScript==
$(document).ready(function() {


    var devicePixelRatio = window.devicePixelRatio;
    var margin = 0.5;

    function px2cm(px, dpi = 268) {
        return px * 2.54 / dpi;
    }

    // On ajoute le bouton d'export PDF
    var btn = document.createElement('input');
    with(btn) {
        setAttribute('value', 'Exporter en PDF');
        setAttribute('type', 'button');
        setAttribute('class', 'button button--secondary smr-4');
        setAttribute('id', 'btnExportPdf');
    }
    $('div.flying-tooltip-help').after(btn);

    // Comportement au clic sur le bouton d'export
    $('#btnExportPdf').click(function(){

      // On stocke le contenu original car on va mdofifier le DOM
      var original_content = $('#wrapper_content').html();
      var wrapper_content = $('#wrapper_content');
      wrapper_content.find('.breadcrumb').remove('.breadcrumb');
      wrapper_content.find('.wrapper__tabs').remove('.wrapper__tabs');
      wrapper_content.find('.wrapper__header__cta-area').remove('.wrapper__header__cta-area');

      wrapper_content.find('.rating-skills__stars').each(function() {
        var nbEtoilesMax = $(this).find('.rating-skills__star').length;
        var nbEtoilesOk = $(this).find('.rating-skills__star--active').length;
        var libSkill = $(this).find('.smr-2').first().text();
        $(this).find('.smr-2').first().text(libSkill + ' (' + nbEtoilesOk + '/' + nbEtoilesMax + ')');
      });

      html2canvas(wrapper_content[0]).then(function(canvas) {

        var originalImgPxWidth = canvas.width;
        var originalImgPxHeight = canvas.height;
        var imgCmWidthConverted = px2cm(originalImgPxWidth);
        var imgCmHeightConverted = px2cm(originalImgPxHeight);
        var ratioH = ((21 * 100) / imgCmWidthConverted) / 100;
        var ratioW = ((29.7 * 100) / imgCmHeightConverted) / 100;

        var goodRatio = ratioH > ratioW ? ratioW : ratioH;

        var imgData = canvas.toDataURL('image/png');

        var doc = jspdf.jsPDF('p', 'cm', [29.7, 21]);

        var newWidth = (imgCmWidthConverted * goodRatio) - (2 * margin);
        var newHeight = (imgCmHeightConverted * goodRatio) - (2 * margin);
        doc.addImage(imgData, 'PNG', margin, margin, newWidth, newHeight);
        var jobId = $("#rfp-id").text().trim();
        //var jobLabel = $("#wrapper-header h1.wrapper__title").text().trim().replace(/\s+/g, "-");
        var jobLabel = $("#wrapper-header h1.wrapper__title").text().trim();
        var customer = $("#rfp-id").next("span").text().replace("pour","").trim().replace(/\s+/g, "-");
        doc.save(jobLabel + "_" + customer + "_" + jobId + '.pdf');
        $('#wrapper_content').html(original_content);
      });
  });
});