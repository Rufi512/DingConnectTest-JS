const prefixList = document.getElementById("prefix-list");
const rechargeForm = document.getElementById("form-container");
const numberPhone = document.getElementById("number");
const button = document.getElementById("button-connect");
const balance = document.getElementById("balance");
const currency = document.getElementById("currency");
const operatorList = document.getElementById("operator-list");
const optionRecharge = document.getElementById("option-recharge");
const screen = document.querySelector(".screen-confirm");
const promotionScreen = document.querySelector(".promotion");
const numberList = document.getElementById("NumbersList");
const promotionsList = document.getElementById("promotions-list")
var country = [];
var products = [];
var listPreview = [];
var numbersPhones = [];
var operators = [];
const API_KEY = "HERE";

const resetForm = () => {
  rechargeForm.reset();
  operatorList.innerHTML = "";
  optionRecharge.innerHTML = "";
};

const resetAll = () => {
  rechargeForm.reset();
  operatorList.innerHTML = "";
  optionRecharge.innerHTML = "";
  listPreview = [];
  numbersPhones = [];
  numberList.innerHTML = numbersPhones.length;
};

window.addEventListener("load", async () => {
  var countryWorld = [];
  /*Request Initial*/
  const resCountry = await fetch(
    "https://api.dingconnect.com/api/V1/GetCountries",
    {
      method: "GET",
      headers: {
        api_key: API_KEY,
      },
    }
  );

  const response = await resCountry.json();

  country = response.Items;

  const resOperators = await fetch(
    "https://api.dingconnect.com/api/V1/GetProviders",
    {
      method: "GET",
      headers: {
        api_key: API_KEY,
      },
    }
  );

  const responseOperators = await resOperators.json();

  operators = await responseOperators.Items;

  /*Obtain list Country*/

  countryWorld = await response.Items;
  countryWorld.map((el, i) => {
    if (el.InternationalDialingInformation[0]) {
      return (prefixList.innerHTML += `<option value=${el.CountryIso}>+${
        el.InternationalDialingInformation[0]
          ? el.InternationalDialingInformation[0].Prefix
          : ""
      }  &nbsp; &nbsp; ${el.CountryName}   </option>`);
    }
  });
});

/*Get Provider number*/
prefixList.addEventListener("change", (e) => {
  operatorList.innerHTML = "";

  country.map((el, i) => {
    if (el.CountryIso === e.target.value) {
      numberPhone.maxLength =
        el.InternationalDialingInformation[0].MaximumLength -
        el.InternationalDialingInformation[0].Prefix.length;
      numberPhone.minLength =
        el.InternationalDialingInformation[0].MinimumLength -
        el.InternationalDialingInformation[0].Prefix.length;
      numberPhone.setAttribute(
        "data-prefix",
        el.InternationalDialingInformation[0].Prefix
      );
    }
  });

  operators.map((el, i) => {
    if (
      el.CountryIso === e.target.value ||
      el.RegionCodes[0] === e.target.value
    ) {
      operatorList.innerHTML += `<div class="selectOperators" 
      id=${el.ProviderCode}
      onClick="getOperatorSelect('${el.ProviderCode}','${el.CountryIso}','${el.ProviderCode}','${el.Name}'); getPromotions('${el.ProviderCode}')">
      <img src=${el.LogoUrl} alt=${el.Name} />
        <p style="margin:0;">${el.Name}</p>
             `;
    }
  });
  if (!operatorList.innerHTML) {
    operatorList.innerHTML = `<p>Operators are not available. You may have a low balance or the country is not supported.</p>`;
  }
});

/*Set Information Operator*/

const getOperatorSelect = async (
  DistributorRef,
  CodeCountry,
  select,
  nameOperator
) => {
  /*Show select on DOM*/

  const boxCheck = document.querySelectorAll(".selectOperators");

  for (el of boxCheck) {
    if (el.id === select) {
      el.style.border = "3px solid";
    } else {
      el.style.border = "none";
    }
  }

  optionRecharge.innerHTML = "";
  const res = await fetch(
    `https://api.dingconnect.com/api/V1/GetProducts?providerCodes=${DistributorRef}&regionCodes=${CodeCountry}`,
    {
      method: "GET",
      headers: {
        api_key: API_KEY,
      },
    }
  );
  const response = await res.json();
  response.Items.map((el) => {
    optionRecharge.innerHTML += `<option 
    
    data-Provider = '${el.ProviderCode}',  
    data-SkuCode = '${el.SkuCode}',
    data-SendValue = '${el.Minimum.SendValue}',
    data-ReceiveValue = '${el.Minimum.ReceiveValue}',
    data-SendCurrencyIso = '${el.Minimum.SendCurrencyIso}',
    data-ReceiveCurrencyIso = '${el.Minimum.ReceiveCurrencyIso}',
    data-NameOperator = '${nameOperator}'
   >
    Paid $${el.Minimum.SendValue} ${el.Minimum.SendCurrencyIso}
    You received ${el.Minimum.ReceiveValue} ${el.Minimum.ReceiveCurrencyIso}

     
    </option>`;
  });
};

const getPromotions = async (providerCode) => {
  promotionsList.innerHTML = "" 
  document.querySelector('.container-promotions').style.display = "none"
  let dataPromotions
  try {
  dataPromotions = await Promise.all([
      //Get all the promotions available from the operator and extract the LocalizationKey
      fetch(
        `https://api.dingconnect.com/api/V1/GetPromotions?providerCodes=${providerCode}`,
        {
          method: "GET",

          headers: {
            "Content-Type": "application/json",
            api_key: API_KEY,
          },
        }
      ).then((response) => response.json()),
      //Get all the promotions and filter them with the previously obtained LocalizationKey

      fetch(
        `https://api.dingconnect.com/api/V1/GetPromotionDescriptions`,
        {
          method: "GET",

          headers: {
            "Content-Type": "application/json",
            api_key: API_KEY,
          },
        }
      ).then((response) => response.json()),
    ]);

  } catch (error) {
    console.log(error);
  }



if(dataPromotions[0].Items[0]){
  document.querySelector('.container-promotions').style.display = "block"

  dataPromotions[1].Items.map((el,i)=>{
    if(el.LocalizationKey === dataPromotions[0].Items[0].LocalizationKey){
     return( promotionsList.innerHTML += `<div class="promotions"
       data-TermsAndConditionsMarkDown='${el.TermsAndConditionsMarkDown}' 
       data-BonusValidity='${el.BonusValidity}'
       data-Headline='${el.Headline}'
       data-PromotionType='${el.PromotionType}'
       onClick="promotionDetails(this,true)">
       <p style="cursor:Pointer">${el.PromotionType} Language: ${el.LanguageCode}</p>
      </div>`)
    }


 return ''
  })
}

};

//Show promotions Details 

const promotionDetails = (elements,show) =>{
if(show){
  document.getElementsByTagName("body")[0].style.overflowY = "hidden";
  promotionScreen.style.opacity = '1'
  promotionScreen.style.visibility = 'visible'
  const Headline = elements.getAttribute('data-Headline')
  const BonusValidity = elements.getAttribute('data-BonusValidity')
  const PromotionType = elements.getAttribute('data-PromotionType')
  const TermsAndConditionsMarkDown = elements.getAttribute('data-TermsAndConditionsMarkDown')
  document.getElementById("promotion-operator").innerHTML = Headline
  document.getElementById("promotion-type").innerHTML = PromotionType
  document.getElementById("promotion-terms").innerHTML = TermsAndConditionsMarkDown
  document.getElementById("promotion-bonus").innerHTML = BonusValidity

}else{
  promotionScreen.style.opacity = '0'
  promotionScreen.style.visibility = 'hidden'
  document.getElementsByTagName("body")[0].style.overflowY = "unset";
}



}

/*Add Form*/

rechargeForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (e.submitter.id === "send") {
    if (numbersPhones.length === 0) {
      return alert("You need add number phone to process paid!");
    }
    return showConfirm();
  }

  /*Provider*/
  const Provider = optionRecharge.options[
    optionRecharge.selectedIndex
  ].getAttribute("data-Provider");
  /*SkuCode*/
  const SkuCode = optionRecharge.options[
    optionRecharge.selectedIndex
  ].getAttribute("data-SkuCode");

  /*SendValue*/
  const SendValue = optionRecharge.options[
    optionRecharge.selectedIndex
  ].getAttribute("data-SendValue");

  /*ReceiveValue*/
  const ReceiveValue = optionRecharge.options[
    optionRecharge.selectedIndex
  ].getAttribute("data-ReceiveValue");

  /*ReceiveCurrencyIso*/
  const ReceiveCurrencyIso = optionRecharge.options[
    optionRecharge.selectedIndex
  ].getAttribute("data-ReceiveCurrencyIso");

  /*SendCurrencyIso*/
  const SendCurrencyIso = optionRecharge.options[
    optionRecharge.selectedIndex
  ].getAttribute("data-SendCurrencyIso");

  /*NameOperator*/
  const nameOperator = optionRecharge.options[
    optionRecharge.selectedIndex
  ].getAttribute("data-NameOperator");

  if (Provider && SkuCode && SendValue && SendCurrencyIso) {
    var rechargePhone = {
      SkuCode: SkuCode,
      SendValue: SendValue,
      SendCurrencyIso: SendCurrencyIso,
      AccountNumber: `${rechargeForm["number"].getAttribute("data-prefix")}${
        rechargeForm["number"].value
      }`,
      DistributorRef: Provider,
      ValidateOnly: true,
    };

    var previewPhone = {
      SendValue: SendValue,
      SendCurrencyIso: SendCurrencyIso,
      ReceiveValue: ReceiveValue,
      ReceiveCurrencyIso: ReceiveCurrencyIso,
      AccountNumber: `${rechargeForm["number"].getAttribute("data-prefix")}${
        rechargeForm["number"].value
      }`,
      DistributorRef: Provider,
      NameOperator: nameOperator,
    };

    const jsonSend = JSON.stringify(rechargePhone);
    const jsonPhone = JSON.stringify(previewPhone);

    if (e.submitter.id === "add") {
      numbersPhones.push(jsonSend);
      listPreview.push(jsonPhone);
      numberList.innerHTML = numbersPhones.length;
      resetForm();
    }
  }
});

/*Process Paid*/
const showConfirm = () => {
  screen.style.opacity = "1";
  screen.style.visibility = "visible";
  screen.style.zIndex = 10000;
  document.getElementsByTagName("body")[0].style.overflowY = "hidden";
  const phonesToRecharge = document.getElementById("phones-recharge");
  phonesToRecharge.innerHTML = "";

  /*Sample payment details list*/

  listPreview.map((el) => {
    const element = JSON.parse(el);
    return (phonesToRecharge.innerHTML += ` <div class="preview-paid">
         <p>Number to paid: +${element.AccountNumber}</p>
         <p>Amount to pay: $${element.SendValue} ${element.SendCurrencyIso}</p>
         <p>Amount to receive: ${element.ReceiveValue} ${element.ReceiveCurrencyIso}</p>
         <p>Operator name: ${element.NameOperator}</p>
      </div>`);
  });
};

const cancelPaids = () => {
  screen.style.opacity = "0";
  screen.style.visibility = "hidden";
  screen.style.zIndex = -1;
  document.getElementsByTagName("body")[0].style.overflowY = "auto";
  resetAll();
};

const paidPhones = async () => {
  screen.style.opacity = "0";
  screen.style.visibility = "hidden";
  screen.style.zIndex = -1;
  document.getElementsByTagName("body")[0].style.overflowY = "auto";

  for await (const el of numbersPhones) {
    const post = await fetch(
      `https://api.dingconnect.com/api/V1/SendTransfer`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          api_key: API_KEY,
        },
        body: el,
      }
    );

    const resPost = await post.json();
    console.log(resPost);
  }
  console.log("finish");
  resetAll();
};
