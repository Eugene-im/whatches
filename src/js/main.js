jQuery(document).ready(function ($) {
    let wow = new WOW({
        mobile: true,
    });
    wow.init();

    // In your Javascript (external .js resource or <script> tag)
    $('#select__sales').select2({
        dropdownCssClass: 'custom'
    });
    $('#select__delivery').select2({
        dropdownCssClass: 'custom'
    });

    /**
     * Download PDF
     * */
    function init_abilityToDownloadPDF(){
        $('.downloadPDF').click(function (e) {
            e.preventDefault();
            let pdf_link = $(this).data('pdf');
            let pdf_title = $(this).data('pdf-title');
            let nonce = $("input[name='downloadPdf_field']").val();
            $.ajax({
                type: 'POST',
                data: {
                    pdf_link: pdf_link,
                    pdf_title: pdf_title,
                    nonce: nonce,
                    action: 'download_pdf',
                },
                url: js_variables.ajaxurl,
                xhrFields: {
                    responseType: 'blob'
                },
                success: function (response, status, xhr) {
                    var disposition = xhr.getResponseHeader('Content-Disposition');
                    var matches = /"([^"]*)"/.exec(disposition);
                    var filename = (matches != null && matches[1] ? matches[1] : pdf_title + '.pdf');

                    if (window.navigator && window.navigator.msSaveOrOpenBlob) { // for IE
                        window.navigator.msSaveOrOpenBlob(response, filename);
                    } else { // for Non-IE (chrome, firefox etc.)
                        var objectUrl = URL.createObjectURL(response);
                        var link = document.createElement('a');
                        link.href = objectUrl;
                        link.download = filename;
                        link.click();
                        URL.revokeObjectURL(objectUrl);
                    }
                }
            });
        });
    }
    init_abilityToDownloadPDF();




    /**
     * PDF Name check
     * */
    let timeoutId;
    $('#file-name').on('keyup', function() {
        clearTimeout(timeoutId);
        // debouncing
        timeoutId = setTimeout(checkNamePdf, 500);
    });
    function checkNamePdf(){
        let pdf_name = $('#file-name').val();
        $.ajax({
            type: 'GET',
            url: 'https://portfolio.qarea.com/wp-json/pdf/1.0/pdf-name-check',
            data: {
                pdf_name: pdf_name
            },
            success: function (response) {
                // remove class to parent div
                if($('.qa-choose-file-name').hasClass('error')){
                    $('.qa-choose-file-name').removeClass('error');
                }
                // remove error
                if($('.name-check.error').length){
                    $('.name-check.error').remove();
                }
                // able submit
                $('.qa-gen-btn.submit').removeAttr('disabled');
                if($('.qa-gen-btn.submit').hasClass('disabled')){
                    $('.qa-gen-btn.submit').removeClass('disabled');
                }
            },
            error: function (response) {
                // add class to parent div
                if(!$('.qa-choose-file-name').hasClass('error')){
                    $('.qa-choose-file-name').addClass('error');
                }
                // show error
                if(!$('.name-check.error').length){
                    $('.qa-choose-file-name').append('<span class="name-check error">'+response.responseJSON.message+'</span>');
                }
                // disable submit
                $('.qa-gen-btn.submit').attr('disabled','disabled');
                if(!$('.qa-gen-btn.submit').hasClass('disabled')){
                    $('.qa-gen-btn.submit').addClass('disabled');
                }
            }
        });
    }
    /**
     * Delete PDF
     * */
    function init__action_remove_pdf(){
        $('.action-remove').click(function (e){
            e.preventDefault();
            let pdf_id = $(this).data('pdfid');
            let user_initiator = $('#usr').val();
            let nonce = $('input[name="delete_pdf"]').val();
            let data = {
                pdf_id: pdf_id,
                user_initiator: user_initiator,
            };
            $.ajax({
                type: 'POST',
                data: {
                    data: data,
                    nonce: nonce,
                    action: 'delete_pdf',
                },
                url: js_variables.ajaxurl,
                success: function (response) {
                    console.log(response.data.message)
                    $('.qa-brand-tr').find('a[data-pdfid="'+response.data.id+'"]')
                        .parent().parent().addClass('removed');
                },
                error: function (response){
                    console.log(response.responseJSON.data.message)
                }
            })
        })
    }
    init__action_remove_pdf();
    /**
     * Submitting portfolio form
     * */
    $('.portfolio-form').submit(function (e) {
        e.preventDefault();
        let brand = $('input[name="brand"]:checked').val();
        let projectsSelected = [];
        $("input[name='portfolio[]']:checked").each(function () {
            projectsSelected.push($(this).val());
        });
        let nonce = $('input[name="portfolioForm_submission"]').val();
        let case_name = $('input[name="case_name"]').val();
        let sales = $('select[name="sales"]').val();
        let delivery = $('select[name="delivery"]').val();
        let case_info = {
            'case_name': case_name,
        };
        let data = {
            brand: brand,
            projects: projectsSelected,
            case_info: case_info,
            sales: sales,
            delivery: delivery,
        };
        $.ajax({
            type: 'POST',
            data: {
                form_data: data,
                nonce: nonce,
                action: 'portfolioForm_submission',
            },
            url: js_variables.ajaxurl,
            beforeSend: function () {
                $('html').addClass('overflow-hidden');
                $('body').append('<div class="loader"><img src="'+js_variables.site_url+'/wp-content/themes/portfolio/loader.gif"></div>');
            },
            success: function (response) {
                // console.log(response.data);
                window.open(response.data, '_blank').focus();
                window.location.href = js_variables.site_url+'/pdfs';
                // $('.qa-choose-creator-name').html(response);
            }
        })
    })
    /**
     * Filters on generate portfolio
     * */
    function is_step_toShowProjects__manual(currentStep) {
        return $('#manually').length > 0 && currentStep == 1;
    } function is_step_toShowProjects__filtered(currentStep) {
        return $('#filter').length > 0 && currentStep == 5;
    }
    function get_projectsList(search = null) {

        let brand = $('input[name="brand"]:checked').val(),
            industry = [],
            technologies = [],
            services = [],
            countries = [],
            nonce = $('input[name="get_projectsList"]').val();
        $("input[name='case_industries[]']:checked").each(function () {
            industry.push($(this).val());
        });
        $("input[name='case_languages[]']:checked").each(function () {
            technologies.push($(this).val());
        });
        $("input[name='case_platforms[]']:checked").each(function () {
            services.push($(this).val());
        });
        $("input[name='countries[]']:checked").each(function () {
            countries.push($(this).val());
        });
        if (industry.length === 0) {
            industry = ['all'];
        }
        if (technologies.length === 0) {
            technologies = ['all'];
        }
        if (services.length === 0) {
            services = ['all'];
        }
        if (countries.length === 0) {
            countries = ['all'];
        }
        let selected = $('input[name="selected__portfolio[]"]').val();
        let data = {
            brand: brand,
            taxonomy_filters: {
                industry: industry,
                technologies: technologies,
                services: services,
                countries: countries,
            },
            selected: selected,
            search: search,
        };
        // console.log('----');
        // console.log(data);
        $.ajax({
            type: 'POST',
            data: {
                data: data,
                nonce: nonce,
                action: 'get_projects_list',
            },
            url: js_variables.ajaxurl,
            beforeSend: function () {
                $('#projectsList').html('Loading...');
            },
            success: function (response) {
                $('#projectsList').html(response);
                init_projectsCheckboxClick();
            }
        })
    }
    function init_projectsCheckboxClick() {
        $('input[name="portfolio[]"]').click(function () {
            if ($(this).hasClass('all-checkbox')) {
                let checkboxes = $('input[name="portfolio[]"]');
                if ($(this).is(':checked')) {
                    checkboxes.prop("checked", true);
                    $.each(checkboxes, function () {
                        let val = $(this).attr('data-projectTitle');
                        let name = $(this).attr('name').slice(0, -2);
                        handleProjectsCheckboxClick(val, name, true);
                    })
                } else {
                    checkboxes.prop("checked", false);
                    $.each(checkboxes, function () {
                        let val = $(this).attr('data-projectTitle');
                        let name = $(this).attr('name').slice(0, -2);
                        handleProjectsCheckboxClick(val, name, false);
                    })
                }
            } else {
                let val = $(this).attr('data-projectTitle');
                let name = $(this).attr('name').slice(0, -2);
                let checked = $(this).is(':checked');
                handleProjectsCheckboxClick(val, name, checked);
            }
        })
    }
    function handleProjectsCheckboxClick(val, name, checked) {
        let selected_taxonomy = $('input[name="selected__portfolio[]"]').val();

        selected_taxonomy = JSON.parse(selected_taxonomy || '[]');
        if (!selected_taxonomy) {
            selected_taxonomy = [];
        }
        if (checked) {
            selected_taxonomy.push(val);
        } else {
            const index = selected_taxonomy.indexOf(val);
            if (index !== -1) {
                selected_taxonomy.splice(index, 1);
            }
        }
        $('input[name="selected__portfolio[]"]').val(JSON.stringify(selected_taxonomy));
        // console.log($('input[name="selected__portfolio[]"]').val())
    }

    $('input[name="portfolio-search"]').on('keyup', function () {
        let search = $(this).val();
        get_projectsList(search);
    });

    /**
    * Steps switching
    * */
    function getActiveStepIndex() {
        let stepsContent = $('.steps-content');
        // console.log(stepsContent);
        let activeStepIndex = 0;
        $.each(stepsContent, function (index, object) {
            if ($(object).hasClass('active')) {
                activeStepIndex = index;
            }
        })
        return activeStepIndex;
    }
    function changeActiveStepIndex(currentStep, action) {
        if (action == 'next') {
            currentStep++;
            // console.log(currentStep);
            setNewActiveStep(currentStep);

            if (is_step_toShowProjects__manual(currentStep)) {
                get_projectsList();
            }
            if (is_step_toShowProjects__filtered(currentStep)) {
                get_projectsList();
            }
        } else if (action == 'prev') {
            if (currentStep !== 0) {
                currentStep--;
                setNewActiveStep(currentStep);
            }
        }
    }
    function setNewActiveStep(newStepIndex) {
        let stepsContent = $('.steps-content');
        let stepsTitles = $('.steps-title');
        $.each(stepsContent, function (index, object) {
            // console.log(index === newStepIndex);
            if (index === newStepIndex) {
                $(object).addClass('active')
            } else {
                $(object).removeClass('active')
            }
        })
        $.each(stepsTitles, function (index, object) {
            // console.log(index === newStepIndex);
            if (index === newStepIndex) {
                $(object).addClass('active')
            } else {
                $(object).removeClass('active')
            }
        })
    }
    // Next step
    $('.qa-gen-btn').click(function () {
        let currentStep = getActiveStepIndex();
        let currentStepOptions = $('.steps-content').find('.qa-gen-options').eq(currentStep);

        if ($(this).hasClass('required-check')) {
            if (currentStepOptions.find('input[type="text"]').toArray().every(input => input.value !== '')) {
                changeActiveStepIndex(currentStep, 'next');
                $('.error-message').hide();
            } else {
                $('.error-message').show();
            }
        } else {
            let isRequiredStep = currentStepOptions.hasClass('required');
            let isRadioButtonOrCheckboxChecked = currentStepOptions.find('input[type="radio"]:checked, input[type="checkbox"]:checked').length > 0;

            if (!isRequiredStep || isRadioButtonOrCheckboxChecked) {
                changeActiveStepIndex(currentStep, 'next');
                $('.error-message').hide();
            } else {
                $('.error-message').show();
            }
        }

        if ($(this).hasClass('submit')) {
            let allTextInputsFilled = currentStepOptions.find('input[type="text"]').toArray().every(input => input.value !== '');

            if (allTextInputsFilled) {
                $('.error-message').hide();
            } else {
                $('.error-message').show();
            }
        }
    });
    // Prev step
    $("#back-steps").click(function (e) {
        let currentStep = getActiveStepIndex();
        if (currentStep == 0) {
            $("#back-steps").attr("href", "/");
        } else {
            changeActiveStepIndex(currentStep, 'prev');
        }
    });

    /**
     * Function to select/unselect all checkboxes
    * */
    function init_selectAllFeatures() {
        $('#select-all-features').click(function () {
            $('input[name="portfolio-features"]').prop('checked', this.checked);
        });
    }
    init_selectAllFeatures();

    /* Creator name check input value */

    $('.qa-gen-steps-options .qa-choose-creator-name input,.qa-gen-steps-options .qa-choose-file-name input').on('input', function () {
        if ($(this).val().length > 0) {
            $(this).addClass('has-text');
        } else {
            $(this).removeClass('has-text');
        }
    });

    /* Ajax prepared PDFs */

    function getData() {
        return {
            sort: $("#sort-by-date").data('sort'),
            max_pages: $('#qa-portfolio-table').data('max-pages'),
            current_page: $('#qa-portfolio-table').data('current-page'),
            sortbrand: $('#sort-by-brand').data('brand'),
            searchTitle: $('#search-file-name').val(),
            searchAuthor: $('#search-author-name').val(),
            selectedIndustry: $('#select__case_industries').val(),
            selectedLanguage: $('#select__case_languages').val(),
            selectedPlatform: $('#select__case_platforms').val(),
        };
    }

    /* Event & Ajax loadmore */

    $('#qa-gen-btn-more').click(function (e) {
        e.preventDefault();
        var data = getData();
        if (data.current_page <= data.max_pages) {
            $.ajax({
                url: js_variables.ajaxurl,
                type: 'POST',
                data: {
                    action: 'load_more_posts',
                    data: data
                },
                success: function (response) {
                    // console.log(response);
                    $('#qa-portfolio-table').append(response.html);
                    if (response.total_pages <= data.current_page) {
                        $('#qa-gen-btn-more').hide();
                    } else {
                        $('#qa-portfolio-table').data('current-page', data.current_page + 1);
                    }
                    init_abilityToDownloadPDF();
                    init__action_remove_pdf();
                }
            });
        } else {
            $('#qa-gen-btn-more').hide();
        }
    });

    /* Event & Ajax sortbydate */

    $("#sort-by-date").click(function () {
        var data = getData();
        var sort = data.sort === 'desc' ? 'asc' : 'desc';
        $("#sort-by-date").data('sort', sort);
        if (sort === "desc") {
            $('#sort-by-date-status').text("last");
        } else {
            $('#sort-by-date-status').text("first");
        }
        data.sort = sort;
        $.ajax({
            type: 'POST',
            url: js_variables.ajaxurl,
            data: {
                action: 'sort_table_data',
                data: data
            },
            success: function (response) {
                $("#qa-portfolio-table").html(response.html);
                if (response.total_pages <= response.current_page) {
                    $('#qa-gen-btn-more').hide();
                } else {
                    $('#qa-gen-btn-more').show();
                }
                init__action_remove_pdf();
                init_abilityToDownloadPDF();
            }
        });
    });

    /* Event & Ajax sortbybrand */

    $("#sort-by-brand").click(function () {
        var data = getData();
        /*switch*/
        switch (data.sortbrand) {
            case 'all':
                data.sortbrand = 'qarea';
                break;
            case 'qarea':
                data.sortbrand = 'testfort';
                break;
            case 'testfort':
                data.sortbrand = 'all';
                break;
        }
        $("#sort-by-brand").data('brand', data.sortbrand);
        $.ajax({
            type: 'POST',
            url: js_variables.ajaxurl,
            data: {
                action: 'sort_table_brand',
                data: data
            },
            success: function (response) {
                $("#qa-portfolio-table").html(response.html);
                $('#sort-by-brand-status').text(data.sortbrand);
                if (response.total_pages <= response.current_page) {
                    $('#qa-gen-btn-more').hide();
                } else {
                    $('#qa-gen-btn-more').show();
                }
                init__action_remove_pdf();
                init_abilityToDownloadPDF();
            }
        });
    });

    /* Event & Ajax searchfilename */

    $('#search-file-name').on('keyup', function () {
        var data = getData();
        $.ajax({
            type: 'POST',
            url: js_variables.ajaxurl,
            data: {
                action: 'search_file_name',
                data: data
            },
            success: function (response) {
                $("#qa-portfolio-table").html(response.html);
                if (response.total_pages <= response.current_page) {
                    $('#qa-gen-btn-more').hide();
                } else {
                    $('#qa-gen-btn-more').show();
                }
                init__action_remove_pdf();
                init_abilityToDownloadPDF();
            }
        });
    });

    /* Event & Ajax search author name */

    $('#search-author-name').on('keyup', function () {
        var data = getData();
        $.ajax({
            type: 'POST',
            url: js_variables.ajaxurl,
            data: {
                action: 'search_author_name',
                data: data
            },
            success: function (response) {
                $("#qa-portfolio-table").html(response.html);
                if (response.total_pages <= response.current_page) {
                    $('#qa-gen-btn-more').hide();
                } else {
                    $('#qa-gen-btn-more').show();
                }
                init__action_remove_pdf();
                init_abilityToDownloadPDF();
            }
        });
    });

    $('#select__case_industries').on('change', function () {
        var data = {
            // Get the other data items from the existing getData() function
            sort: getData().sort,
            max_pages: getData().max_pages,
            current_page: getData().current_page,
            sortbrand: getData().sortbrand,
            searchTitle: getData().searchTitle,
            searchAuthor: getData().searchAuthor,
            // Get the selected value from the dropdown
            selectedIndustry: $('#select__case_industries').val(),
            selectedLanguage: $('#select__case_languages').val(),
            selectedPlatform: $('#select__case_platforms').val(),
        };
        $.ajax({
            type: 'POST',
            url: js_variables.ajaxurl,
            data: {
                action: 'filter_cases',
                data: data
            },
            success: function (response) {
                $("#qa-portfolio-table").html(response.html);
                if (response.total_pages <= response.current_page) {
                    $('#qa-gen-btn-more').hide();
                } else {
                    $('#qa-gen-btn-more').show();
                }
            }
        });
    });

    $('#select__case_platforms').on('change', function () {
        var data = {
            // Get the other data items from the existing getData() function
            sort: getData().sort,
            max_pages: getData().max_pages,
            current_page: getData().current_page,
            sortbrand: getData().sortbrand,
            searchTitle: getData().searchTitle,
            searchAuthor: getData().searchAuthor,
            // Get the selected value from the dropdown
            selectedIndustry: $('#select__case_industries').val(),
            selectedLanguage: $('#select__case_languages').val(),
            selectedPlatform: $('#select__case_platforms').val(),
        };

        $.ajax({
            type: 'POST',
            url: js_variables.ajaxurl,
            data: {
                action: 'filter_cases',
                data: data
            },
            success: function (response) {
                console.log(response);
                $("#qa-portfolio-table").html(response.html);
                if (response.total_pages <= response.current_page) {
                    $('#qa-gen-btn-more').hide();
                } else {
                    $('#qa-gen-btn-more').show();
                }
            }
        });
    });

    $('#select__case_languages').on('change', function () {
        var data = {
            // Get the other data items from the existing getData() function
            sort: getData().sort,
            max_pages: getData().max_pages,
            current_page: getData().current_page,
            sortbrand: getData().sortbrand,
            searchTitle: getData().searchTitle,
            searchAuthor: getData().searchAuthor,
            // Get the selected value from the dropdown
            selectedIndustry: $('#select__case_industries').val(),
            selectedLanguage: $('#select__case_languages').val(),
            selectedPlatform: $('#select__case_platforms').val(),
        };

        $.ajax({
            type: 'POST',
            url: js_variables.ajaxurl,
            data: {
                action: 'filter_cases',
                data: data
            },
            success: function (response) {
                console.log(response);
                $("#qa-portfolio-table").html(response.html);
                if (response.total_pages <= response.current_page) {
                    $('#qa-gen-btn-more').hide();
                } else {
                    $('#qa-gen-btn-more').show();
                }
            }
        });
    });

    /* Taxonomy Handle All Check Box Click */
    /* Function to handle checkbox click */
    function handleCheckboxClick(val, name, checked) {
        let selected_taxonomy = $('input[name="selected__' + name + '[]"]').val();

        selected_taxonomy = JSON.parse(selected_taxonomy || '[]');
        if (!selected_taxonomy) {
            selected_taxonomy = [];
        }
        if (checked) {
            selected_taxonomy.push(val);
        } else {
            const index = selected_taxonomy.indexOf(val);
            if (index !== -1) {
                selected_taxonomy.splice(index, 1);
            }
        }
        $('input[name="selected__' + name + '[]"]').val(JSON.stringify(selected_taxonomy));
    }

    function init_termCheckboxClick() {
        $('.qa-checkbox-toggle').click(function () {
            if ($(this).hasClass('all-checkbox')) {
                let $block = $(this).closest('.qa-industry-choose-block');
                let checkboxes = $block.find(".qa-checkbox-toggle");
                if ($(this).is(':checked')) {
                    checkboxes.prop("checked", true);
                    $.each(checkboxes, function () {
                        let val = $(this).val();
                        let name = $(this).attr('name').slice(0, -2);
                        handleCheckboxClick(val, name, true);
                    })
                } else {
                    checkboxes.prop("checked", false);
                    $.each(checkboxes, function () {
                        let val = $(this).val();
                        let name = $(this).attr('name').slice(0, -2);
                        handleCheckboxClick(val, name, false);
                    })
                }
            } else {
                let val = $(this).val();
                let name = $(this).attr('name').slice(0, -2);
                let checked = $(this).is(':checked');
                handleCheckboxClick(val, name, checked);
            }
        })
    }
    init_termCheckboxClick();

    /* Ajax search for taxonomy */
    $('.qa-gen-options').each(function () {
        var $block = $(this);
        var $list = $block.find('.qa-choose-list');
        var searchInput = $block.find('.search-taxonomy');


        searchInput.on('keyup', function () {
            let slugTaxonomy = $block.find('.qa-industry-choose-block').data('taxonomy');
            let searchTaxonomy = $block.find('.search-taxonomy').val();
            let selectedValues = $block.find('input[name="selected__' + slugTaxonomy + '[]"]').val();

            $.ajax({
                type: 'POST',
                url: js_variables.ajaxurl,
                data: {
                    action: 'search_taxonomy',
                    data: {
                        slugTaxonomy: slugTaxonomy,
                        searchTaxonomy: searchTaxonomy,
                        selectedValues: selectedValues,
                    },
                },
                success: function (response) {
                    if (response.taxonomy === slugTaxonomy) {
                        $list.html(response.html);
                        init_termCheckboxClick();
                    }
                },
            });
        });
    });
});


