$(document).ready(function () {
    $("#numElev_2, #numElev_3, #elevPriceUnit, #elevTotal, #installationFee, #total_").attr('readonly', true);

    var numApp, numFloors, numBase, maxOcc;
    var prodRange = {
        type: null,
        price: null,
        installationFeePercentage: null
    };

    $('.formField').on('keyup', function () {
        doCalc();
    });


    /* 1) UNIT PRICE: show the price when selected (only had for "standard") */
    $('#standard, #premium, #excelium').on('click', function () {
        if ($("#standard").is(":checked")) {
            document.getElementById('elevPriceUnit').value = (7565).toFixed(2) + " $";
        }
        else if ($("#premium").is(":checked")) {
            document.getElementById('elevPriceUnit').value = (12345).toFixed(2) + " $";
        } else {
            document.getElementById('elevPriceUnit').value = (15400).toFixed(2) + " $";
        }
        doCalc();
    });
    /* /1) UNIT PRICE: show the price when selected (only had for "standard") */

    $('#residential, #commercial, #corporate, #hybrid').on('click', function () {
        initialize();
    });


    function initialize() {
        $('.formField').val('');
        $('.productRangeBtn').prop('checked', false);
    };

    function getInfoNumApp() {
        numApp = $('#numApp').val();
    };

    function getInfoNumFloors() {
        numFloors = $('#numFloors').val();
    };

    function getInfoNumBase() {
        numBase = $('#numBase').val();
    };

    function getInfoNumElev() {
        numElev = $('#numElev').val();
    };

    function getInfoMaxOcc() {
        maxOcc = $('#maxOcc').val();
    };

    function getProdRange() {
        if ($('#standard').is(':checked')) {
            prodRange.type = "standard";
            prodRange.price = parseFloat(7565);
            prodRange.installationFeePercentage = 0.1;
            return prodRange;

        } else if ($('#premium').is(':checked')) {
            prodRange.type = "premium";
            prodRange.price = parseFloat(123456);
            prodRange.installationFeePercentage = 0.13;
            return prodRange;

        } else if ($('#excelium').is(':checked')) {
            prodRange.type = "excelium";
            prodRange.price = parseFloat(15400);
            prodRange.installationFeePercentage = 0.16;
            return prodRange;
        } else {
            prodRange.type = null,
            prodRange.price = null,
            prodRange.installationFeePercentage = null
            return prodRange;
        }
    };

    function GetInfos() {
        /* 4) NUM APP: send info */
        getInfoNumApp();
        /* /4) NUM APP: send info */
        getInfoNumFloors();
        getInfoNumBase();
        getInfoNumElev();
        getInfoMaxOcc();
        getProdRange();
    };

    function setRequiredElevatorsResult(finNumElev) {
        $("#numElev_2, #numElev_3").val(parseFloat(finNumElev));
    };

    function setPricesResults(finNumElev, roughTotal, installFee, total) {
        $("#elevTotal").val(parseFloat(roughTotal).toFixed(2) + " $");
        $("#installationFee").val(parseFloat(installFee).toFixed(2) + " $");
        $("#total_").val(parseFloat(total).toFixed(2) + " $");
    };

    /* 2) N. OF ELEVATORS delete information when mandatory field is empty */
    function emptyElevatorsNumberAndPricesFields() {
        $('#numElev_2, #numElev_3').val('');
        $('.priceField').val('');
    };
    /* /2) N. OF ELEVATORS delete information when mandatory field is empty */

    function createFormData(projectType) {
        return {
            numberApp: numApp,
            numberFloors: numFloors,
            /* 6) NUM. OF ELEVATOR SHAFT: send info */
            numberElev: numElev,
            /* /6) NUM. OF ELEVATOR SHAFT: send info */
            numberBase: numBase,
            maximumOcc: maxOcc,
            productRange: prodRange,
            projectType: projectType
        }
    };

    function negativeValues() {
        if ($('#numApp').val() < 0) {

            alert("Please enter a positive number!");
            $('#numApp').val('');
            return true

    /* 3) NUM OF FLOORS: can't be negative */    
    } else if ($('#numFloors').val() < 0) {

        alert("Please enter a positive number!");
        $('#numFloors').val('');
        return true
    /* /3) NUM OF FLOORS: can't be negative */   

        } else if ($('#numBase').val() < 0) {

            alert("Please enter a positive number!");
            $('#numBase').val('');
            return true

        } else if ($('#numComp').val() < 0) {

            alert("Please enter a positive number!");
            $('#numComp').val('');
            return true

        } else if ($('#numPark').val() < 0) {

            alert("Please enter a positive number!");
            $('#numPark').val('');
            return true

        } else if ($('#numElev').val() < 0) {

            alert("Please enter a positive number!");
            $('#numElev').val('');
            return true

        } else if ($('#numCorpo').val() < 0) {

            alert("Please enter a positive number!");
            $('#numCorpo').val('');
            return true

        } else if ($('#maxOcc').val() < 0) {

            alert("Please enter a positive number!");
            $('#maxOcc').val('');
            return true
        } else {
            return false
        }
    };

    function apiCall(projectType) {
        //Getting numbers from quote
        GetInfos();

        //Preparing data for Api call
        formData = createFormData(projectType)

        $.ajax({
            type: "POST",
            // url: 'http://localhost:3000/api/quoteCalculation/', //for local testing
            url: 'https://rocketelevators-quote.herokuapp.com/api/quoteCalculation/',
            data: JSON.stringify(formData),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                setRequiredElevatorsResult(data.finalNumElev);
                if (prodRange.type != null) {
                    setPricesResults(data.finalNumElev, data.subTotal, data.installationFee, data.grandTotal);
                }
            }
        });
    }
    
    function doCalc() {
        if ($('#residential').hasClass('active') && !negativeValues() && $('#numApp').val() && $('#numFloors').val()) {
            apiCall('residential')
        } 
        /* 5) NUM. OF ELEVATOR SHAFT => REQUIRED ELEVATORS + N. OF ELEVATORS */
          else if ($('#commercial').hasClass('active') && !negativeValues() && $('#numElev').val()) {
            apiCall('commercial')
        /* 5) NUM. OF ELEVATOR SHAFT => REQUIRED ELEVATORS + N. OF ELEVATORS */
        } else if ($('#corporate').hasClass('active') && !negativeValues() && $('#numFloors').val() && $('#numBase').val() && $('#maxOcc').val()) {
            apiCall('corporate')
        /* 8) HYBRID: didn't work at all  */
        } else if ($('#hybrid').hasClass('active') && !negativeValues() && $('#numFloors').val() && $('#numBase').val() && $('#maxOcc').val()) {
            apiCall('hybrid')
        /* /8) HYBRID: didn't work at all  */
        } else {
            emptyElevatorsNumberAndPricesFields();
        };
    };
});
