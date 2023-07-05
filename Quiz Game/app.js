
const gotoPage2=document.querySelector('#goto-page-2');
const backtoPage1=document.querySelector('#backto-page-1');
const startBtn=document.querySelector('#start-game');
const startContainer=document.querySelector('#app > .start');

gotoPage2.addEventListener('click', function(){
    let w=startContainer.clientWidth;
    startContainer.animate([{transform: 'translateX(0px)'}, {transform: 'translateX(-'+w+'px)'}], {
        fill: 'forwards',
        delay: 300,
        duration: (w>780)? 500: 350,
    })
    
})
backtoPage1.addEventListener('click', function(){
    let w=startContainer.clientWidth;
    startContainer.animate([{transform: 'translateX(-'+w+'px)'}, {transform: 'translateX(0px)'}], {
        fill: 'forwards',
        delay: 300,
        duration: (w>780)? 500: 350,
    })
    
})
startBtn.addEventListener('click', parseFeatures)

function makeModal(){
    document.querySelector('#modal').style.display='block';
}

function parseFeatures(){
    makeModal();
    const numberQ=document.querySelector('input[name="qNumber"]:checked');    
    const endFail=document.querySelector('input[name="showProgress"]:checked');    
    const qTime=document.querySelector('input[name="qTime"]:checked');  
    const qType=document.querySelector('input[name="qType"]:checked');    
    const a={
        number: (numberQ)? parseInt(numberQ.value):  null,
        useTime: (qTime)? parseInt(qTime.value): false,
        endIfFail: (endFail && !!parseInt(endFail.value))? true: false,
        type: (qType)? qType.value:  '',
    };
    let arr=[];
    let f=fetch('questions.json');
    f.then(e=>{
        if(e.status>=200 && e.status<=304){
          e.json().then(data=>{
               arr=data.questions;
               startContainer.style.display='none';
               Quiz.init(arr, a);
               setTimeout(()=>{document.querySelector('#modal').style.display='none';}, 1000)
          }) 
          
          return;
        }
        console.error(e.statusText)
    })
}
