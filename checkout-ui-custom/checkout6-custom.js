$(function () {
    // var d = document, 
    //     g = d.createElement("script"),
    //     s = d.getElementsByTagName("script")[0];
    // g.async = !0, 
    // g.src = "https://cdn-te.e-goi.com/tng/vtex-te.min.js",
    // g.setAttribute("client_id", "174484"), 
    // g.setAttribute("list_id", "2"),
    // s.parentNode.insertBefore(g, s);

    ({
        waitForElement(target, callback, interval = 500) {
            let tries = 0;
            let checkExist = setInterval(function () {
                if ($(target).length) {
                    clearInterval(checkExist);
                    callback && callback();
                } else {
                    tries++;
                    if (tries > 100) {
                        clearInterval(checkExist);
                    }
                }
            }, interval);
        },
        init: function () {
            $(document).ready(() => {

                this.eventOrderFormUpdated();
                this.createButtonForGift();
                
            });
        },
        eventOrderFormUpdated: function () {
            
            
            $(window).on('orderFormUpdated.vtex', () => {
                
                
                this.addFreteInfo();
                this.waitForElement('.summary-template-holder', () => {
                    this.createButtonForGift();
                });
                this.waitForElement('#bundle-item0', () => {
                    this.addImgEmbalagem()
                });
                this.transformLinkToCheckbox()
                this.createToolTip()
                this.addGiftExchangeSpan()
                this.addTooltipCoupon()

                
            });
        },
        createButtonForGift() {
            
            const orderForm = vtexjs.checkout.orderForm;
        
            if (!orderForm?.selectableGifts?.length) return;
            const buyButton = document.querySelector("#cart-to-orderform");
            const summaryTemplateHolder = document.querySelector('.summary-template-holder');

            const toggleBuyButtonDisabled = (isDisabled) => {
                if (!buyButton) return;
                buyButton.style.pointerEvents = isDisabled ? "none" : "auto";
                buyButton.style.cursor = isDisabled ? "default" : "pointer";
            };
        
            toggleBuyButtonDisabled(true);
        
            const pElement = document.querySelector('.message-for-gift');
            const pElementAfterBuyButton = buyButton ? buyButton.nextElementSibling : null;

            if (document.querySelector('.select-gift.active')) {
                document.querySelector('.cart-select-gift-placeholder')?.classList.add("available-gift-items-open");
                toggleBuyButtonDisabled(false);

                // Esconde os parágrafos quando .select-gift.active está presente
                if (pElement) pElement.style.display = 'none';
                if (pElementAfterBuyButton) pElementAfterBuyButton.style.display = 'none';
            } else {
                if (pElement) pElement.style.display = 'block';
                if (pElementAfterBuyButton) pElementAfterBuyButton.style.display = 'block';
            }
        
            if (!document.querySelector('.button-for-gift') && summaryTemplateHolder) {
                const buttonHTML = `
                    <button class="button-for-gift">Clique Aqui para escolher seu brinde</button>
                    <p class="message-for-gift">Por favor, selecione seu brinde antes de prosseguir.</p>
                `;
                summaryTemplateHolder.insertAdjacentHTML('afterbegin', buttonHTML);

                // Copie o parágrafo e insira-o após o buyButton
                if (buyButton) {
                    const pElementClone = document.querySelector('.message-for-gift').cloneNode(true);
                    buyButton.parentNode.insertBefore(pElementClone, buyButton.nextSibling);
                }

                const newButton = document.querySelector('.button-for-gift');
                newButton.addEventListener('click', handleButtonClick);
            }

            function handleButtonClick() {
                
                
                const cartPlaceholder = document.querySelector('.cart-select-gift-placeholder');
                if (cartPlaceholder) {
                    if (cartPlaceholder.classList.contains("available-gift-items-open")) {
                        cartPlaceholder.classList.remove("available-gift-items-open");
                    } else {
                        cartPlaceholder.classList.add("available-gift-items-open");
                    }
                }
            }
            if(orderForm.selectableGifts[0].availableGifts.length == 1) {

                if(orderForm.messages[0]) {
                    toggleBuyButtonDisabled(false); // Aqui está sendo definido para "auto" e "pointer"
                    
                    if (pElement) pElement.style.display = 'none';
                    if (pElementAfterBuyButton) pElementAfterBuyButton.style.display = 'none';
                
                }
            }
        },

        addFreteInfo: async function () {
            var frete = localStorage.getItem("FreteGratisValue");

            if (!$('.div-checkout-info').length && frete) {
                const divFreteGratis = `
                <div class="div-checkout-info">
                    <img src="/arquivos/icon-show-frete-msg.png"/>
                    <span class="text-info-frete">FRETE GRÁTIS <strong>ACIMA DE</strong> R$ ${frete},00</span>
                </div>
            `;
                $('.cart-links.cart-links-bottom').append(divFreteGratis);
            }
        },

        addImgEmbalagem: async function () {
            

    var images = {
        'Embalagem de presente cupcake': '/arquivos/cupcake.jpg',
        'Embalagem de presente confete': '/arquivos/bolinhas.jpg'
        // Verifique se as chaves correspondem exatamente ao texto das opções
    };

    var selectElement = document.getElementById('bundle-item0');

    if (selectElement) {
        var imageElement = document.getElementById('giftImage') || document.createElement('img');
        imageElement.id = 'giftImage';
        imageElement.style.height = '100px'; // Limita a altura da imagem a 100px
        imageElement.style.width = 'auto'; 
        selectElement.parentNode.insertBefore(imageElement, selectElement.nextSibling);

        function updateImage() {
            var selectedOptionFullText = selectElement.options[selectElement.selectedIndex].text;
            var selectedOption = selectedOptionFullText.split(':')[0]; // Isso irá extrair "Embalagem de presente cupcake" da string completa
            
        
            var imagePath = images[selectedOption];
            
        
            if (imagePath) {
                imageElement.src = imagePath;
                imageElement.style.display = 'block';
            } else {
                imageElement.style.display = 'none';
                console.error('Caminho da imagem não encontrado para a opção:', selectedOption);
            }
        }

        selectElement.addEventListener('change', updateImage);
        updateImage(); // Chama a função para definir a imagem inicialmente
    } else {
        console.error('Elemento select #bundle-item0 não encontrado no DOM.');
    }
            
        },
        transformLinkToCheckbox: function () {
            this.waitForElement('.add-service', () => {
                var link = document.querySelector('.add-service');

                if (link && !document.getElementById('gift-wrap-checkbox')) { // Verifica se o checkbox já existe
                    // link.style.display = 'none';

                    var checkbox = document.createElement('input');
                    checkbox.setAttribute('type', 'checkbox');
                    checkbox.id = 'gift-wrap-checkbox';

                    link.parentNode.insertBefore(checkbox, link.nextSibling);

                    checkbox.addEventListener('change', function() {
                        if (this.checked) {
                            link.click();
                        }
                    });
                }
            });
        },
        createToolTip: function() {

            this.waitForElement('.link-coupon-add', () => {


                
                var couponLink = document.querySelector('.cart-totalizers .link-coupon-add');
                console.log(couponLink, "coupon aqui")
  
                // Criar o ícone de interrogação
                var questionIcon = document.createElement('img');
                questionIcon.src = '/arquivos/tool-tip.png'; // Substitua pelo caminho correto da imagem
                questionIcon.alt = 'Informações';
                questionIcon.style.cursor = 'help';
                questionIcon.style.marginLeft = '5px';
                console.log(questionIcon, "coupon aqui 3")

                
                // Adicionar o tooltip
                var tooltip = document.createElement('span');
                tooltip.textContent = 'Clique aqui e digite o seu Código de desconto!'; // Substitua pelo texto que você quer que apareça no tooltip
                tooltip.style.visibility = 'hidden';
                tooltip.style.position = 'absolute';
                tooltip.style.backgroundColor = 'black';
                tooltip.style.color = 'white';
                tooltip.style.borderRadius = '10px';
                tooltip.style.padding = '5px';
                tooltip.style.fontSize = '12px';
                tooltip.style.zIndex = '1000';
                tooltip.classList.add('tool-tip-span')
                console.log(tooltip, "coupon aqui 2")

                
                // Posicionar o tooltip acima do ícone quando o mouse passar por cima
                questionIcon.addEventListener('mouseover', function() {
                    tooltip.style.visibility = 'visible';
                    tooltip.style.bottom = '100%';
                    tooltip.style.left = '50%';
                    tooltip.style.transform = 'translateX(-50%)';
                });
                
                // Esconder o tooltip quando o mouse sair
                questionIcon.addEventListener('mouseout', function() {
                    tooltip.style.visibility = 'hidden';
                });
                
                // Inserir o ícone de interrogação e o tooltip após o link
                couponLink.parentNode.insertBefore(questionIcon, couponLink.nextSibling);
                couponLink.parentNode.insertBefore(tooltip, questionIcon.nextSibling);
                
            });           
            
        },
        addGiftExchangeSpan: function() {

            this.waitForElement('.totalizers-list', () => {
        
                // Encontra o elemento da lista de totalizadores
                const totalizersList = document.querySelector('.totalizers-list');
                if (!totalizersList) return;
        
                // Cria o span para "vale presente/troca"
                const span = document.createElement('span');
                span.textContent = 'Vale presente/Troca';
                span.style.marginRight = '10px';
        
                // Cria o ícone do tooltip
                const questionIcon = document.createElement('img');
                questionIcon.src = '/arquivos/tool-tip.png'; // Caminho da imagem do ícone
                questionIcon.alt = 'Informações';
                questionIcon.style.cursor = 'help';
                questionIcon.style.marginLeft = '5px';
        
                // Cria o tooltip
                const tooltip = document.createElement('span');
                tooltip.textContent = 'Selecione junto ao modo de pagamento na próxima etapa';
                tooltip.style.visibility = 'hidden';
                tooltip.style.position = 'absolute';
                tooltip.style.backgroundColor = 'black';
                tooltip.style.color = 'white';
                tooltip.style.borderRadius = '10px';
                tooltip.style.padding = '5px';
                tooltip.style.fontSize = '12px';
                tooltip.style.zIndex = '1000';
                tooltip.classList.add('tool-tip-span')

        
                // Adiciona eventos ao ícone para mostrar e esconder o tooltip
                questionIcon.addEventListener('mouseover', function () {
                    tooltip.style.visibility = 'visible';
                    tooltip.style.bottom = '100%';
                    tooltip.style.left = '50%';
                    tooltip.style.transform = 'translateX(-50%)';
                });
                questionIcon.addEventListener('mouseout', function () {
                    tooltip.style.visibility = 'hidden';
                });
        
                // Cria um contêiner para o span e o tooltip
                const container = document.createElement('div');
                container.classList.add("span-vale-troca")
                container.appendChild(span);
                container.appendChild(questionIcon);
                container.appendChild(tooltip);

                // Insere o contêiner como o primeiro elemento dentro de .totalizerz-list
                if(document.querySelector('.span-vale-troca')) {
                    return
                } else {

                    totalizersList.insertBefore(container, totalizersList.firstChild);
                }
            })
        },
        addTooltipCoupon: function() {

            this.waitForElement('.coupon-fieldset', () => {
        
                var couponLabel = document.querySelector('label[for="cart-coupon"]');

                // Cria o ícone ou elemento que funcionará como um tooltip
                var tooltipIcon = document.createElement('span');
                tooltipIcon.textContent = '?'; // ou insira uma imagem se preferir
                tooltipIcon.style.cursor = 'help';
                tooltipIcon.style.marginLeft = '5px';
                tooltipIcon.style.borderBottom = '1px dotted #000'; // Estilo de sublinhado pontilhado para indicar que é um tooltip

                // Cria o elemento de tooltip
                var tooltip = document.createElement('div');
                tooltip.textContent = 'Insira seu código de desconto aqui!';
                tooltip.style.visibility = 'hidden';
                tooltip.style.position = 'absolute';
                tooltip.style.backgroundColor = 'black';
                tooltip.style.color = 'white';
                tooltip.style.textAlign = 'center';
                tooltip.style.borderRadius = '6px';
                tooltip.style.padding = '5px 10px';
                tooltip.style.zIndex = '1000';
                tooltip.style.fontSize = '12px';
                tooltip.style.marginTop = '20px'; // Ajuste conforme necessário
                tooltip.style.marginLeft = '-50px'; // Centraliza o tooltip, ajuste conforme necessário
                tooltip.style.whiteSpace = 'nowrap';

                // Adiciona eventos ao ícone para mostrar e esconder o tooltip
                tooltipIcon.addEventListener('mouseenter', function () {
                    tooltip.style.visibility = 'visible';
                });
                tooltipIcon.addEventListener('mouseleave', function () {
                    tooltip.style.visibility = 'hidden';
                });

                // Insere o ícone do tooltip e o próprio tooltip no DOM
                couponLabel.appendChild(tooltipIcon);
                couponLabel.appendChild(tooltip);
            })
        }
    }.init());
}); // NÃO REMOVER ESSE PONTO E VIRGULA!