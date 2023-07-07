const Quiz=(function(){
    const objString=(e)=>Object.prototype.toString.call(e);
    const isObj=(e)=>(objString(e) === '[object Object]');
    const isArray=(e)=>(objString(e) === '[object Array]');
    
    let QST=null;

    const parentDiv=document.createElement('div');
    const questions='\
    <div class="app-head"> <h3 id="q-no">Question 1</h3> <div class="time-container" data-time=""><div id="time-taken"></div></div></div>\
    <div class="current-question">\
       <div id="question">Q: <span class="question">Who was the first woman to fly solo across the Atlantic Ocean?</span></div>\
       <div class="options">\
       </div>\
    </div>\
    <div class="question-switch"><select id="quiz-switch"></select></div>\
    <div class="app-face-control"><button id="app-back">Back</button> <button id="app-next">Next</button></div>\
    <div class="app-flex"><button id="submit">SUBMIT</button></div>';
     
   parentDiv.innerHTML=questions;
   const types={__proto__:null};
  
   const a=['number', 'useTime', 'type'];
   let index=0;
   let useTime=false;
   let total, time, divTime=1;
   let stack=[],
   numberofQuestions=null,
   type=null,
   score=0;
    

    function createQuestionStack(a){
        stack=isArray(a)? a.slice(): [];
        if(type in types){stack=stack.filter(e=>(e.t===type))}
        stack.sort(()=>(Math.random() > 0.5)? 1: -1);
        if(typeof numberofQuestions=='number'){stack=stack.slice(0, numberofQuestions)}
        total=stack.length;
    }
    function showResult(){
        let pC=((score/total)*100).toFixed(1), pic=(pC>55)? 'success.webp': 'frown.webp', comp=(pC>55)? 'Great Job!': 'Awwwn...';
        return (
            '<div class="quiz-result">\
            <div class="quiz-image">\
               <img src="'+pic+'" alt="'+comp+' Picture" />\
            </div>\
            <div class="quiz-details">\
            <div>\
               <h3>'+comp+'</h3>\
            </div>\
            <div><h2>'+pC+'%</h2></div>\
            <div>\
               <div>You got '+score+' out of '+total+' questions.</div>\
            </div>\
            <div><button id="play-again">Play Again</button></div>\
         </div>\
      </div>'
        )
    }

    function addSelected(){
        let sel=appFace.querySelector('.options .selected span');
        let qP=stack[index];
        if(sel){qP.selected=sel.textContent}
    }
    
    function Next(){
        addSelected();
        clearInterval(time);
        let a;(index===total-1)? null:index+=1;
        (a=appFace.firstElementChild)? a.remove(): null;
        setTimeout(()=>{
            let v=stack[index];
            createQuestion(v);
        }, 500);
    }
    
    function Back(){
        addSelected();
        clearInterval(time);
        let a;(index===0)? null:index-=1;
        (a=appFace.firstElementChild)? a.remove(): null;
        setTimeout(()=>{
            let v=stack[index];
            createQuestion(v); 
        }, 500);
    }

    function createSltOptions(){
        stack.forEach((e, i)=>{
          const options=document.createElement('option');
          options.text=(i+1);
          slt.appendChild(options);
        });
     }

     function SubmitQuiz(){
            clearInterval(time);
            let end=confirm('Are you sure you want to submit? \nYou can still go through the quiz.');
            if(end){endGame();return}
            doTime(useTime);
     }

     function changeSelect(){
        clearInterval(time);
        let sel=appFace.querySelector('.options .selected span');
        let qP=stack[index];
        if(sel){qP.selected=sel.textContent}
        let a;(index===0)? null:index-=1;
        (a=appFace.firstElementChild)? a.remove(): null;
        setTimeout(()=>{
           let v=stack[index];
           createQuestion(v); 
        }, 500);
        index=this.selectedIndex;
       }

    function clearValues(){
        nBtn.removeEventListener('click', Next);
        bBtn.removeEventListener('click', Back);
        parentDiv.querySelector('#submit').removeEventListener('click', SubmitQuiz);
        slt.innerHTML=null;
        Tcont.style.color='white';
        stack=[],numberofQuestions=null,QST=undefined,
        type=null,score=0,total=0, time=0, divTime=1, index=0, useTime=false;
    }

    function playAgain(){
            let modal=document.querySelector('#modal');
            modal.style.display='block';appFace.innerHTML=null;appFace.hidden=true;
            let startCont=document.querySelector('#app > .start');
            if(startCont.style.transform!=='translateX(0px)'){startCont.style.transform='translateX(0px)'}
            startCont.style.display='grid';setTimeout(()=>{modal.style.display='none'}, 1000);
    }
     
       function start(o){
           if(!isObj(o)){return false}
           let c=structuredClone(o);
           Object.keys(c).forEach(e=>{if(a.includes(e)){return;} delete c[e]});
           useTime=(c.useTime && !isNaN(c.useTime=parseInt(c.useTime)))? c.useTime: !1;
           divTime=(useTime)? useTime: 1;
           type=(typeof c.type === 'string')? c.type: null;
           numberofQuestions=(typeof c.number=='number')? c.number: QST.length;
           createQuestionStack(QST);
           appFace.hidden=false;
           parentDiv.querySelector('#submit').addEventListener('click', SubmitQuiz);
           nBtn.addEventListener('click', Next);
           bBtn.addEventListener('click', Back);
           slt.addEventListener('change', changeSelect)
           createSltOptions();
           if(typeof useTime === 'number'){parentDiv.querySelector('.app-head').appendChild(Tcont);}
           createQuestion(stack[index]);
        }
        function endGame(){
            clearInterval(time);
            addSelected();
            stack.forEach((e)=>void (e.selected===e.ans)? score+=1: null)
            let modal=document.querySelector('#modal');
            modal.style.display='block';
            appFace.innerHTML=null;
            appFace.innerHTML=showResult();
            appFace.querySelector('#play-again').addEventListener('click', playAgain);
            clearValues();
            setTimeout(()=>{modal.style.display='none'}, 1000);
         }

   const appFace=document.querySelector('#app-face');
   const bBtn=parentDiv.querySelector('#app-back');   
   const nBtn=parentDiv.querySelector('#app-next');  
   const slt=parentDiv.querySelector('#quiz-switch');
   const Tcont=parentDiv.querySelector('.time-container');
   const tTaken=parentDiv.querySelector('#time-taken');
   Tcont.remove();
   bBtn.remove();nBtn.remove();
   

   function createQuestion(o){
        const {q, opts, selected} = o;
        let alpha=['A', 'B', 'C', 'D', 'E'];
        const qt=parentDiv.querySelector('.question'); 
        const aFCont=parentDiv.querySelector('.app-face-control');
        const opt=parentDiv.querySelector('.options');
        const n=parentDiv.querySelector('#q-no');
        opt.innerHTML=null;
        slt.selectedIndex=index;
        n.textContent='Question '.concat(index+1);
        qt.textContent=(typeof q=='string')? q: '';
        (isObj(opts))?
           Object.values(opts).forEach((e, i)=>{
              let div=document.createElement('div');
              if(e===selected){div.className='selected'};
              div.innerHTML=alpha[i]+'.) <span>'+e+'</span>';
              div.addEventListener('click', function(){
              let a=parentDiv.querySelector('.selected');if(a){a.classList.remove('selected');} this.classList.add('selected');
            })
              opt.appendChild(div);
           })
       : null;
       (index===0)? bBtn.remove(): ((!aFCont.contains(bBtn) && aFCont.contains(nBtn)) ? aFCont.insertBefore(bBtn, nBtn): null);
       
       (index===total-1)? nBtn.remove(): ((!aFCont.contains(nBtn)) ? aFCont.appendChild(nBtn): null);
    
       appFace.appendChild(parentDiv);
       if(typeof useTime === 'number'){doTime()};
    }
    
    function doTime(){
        time=setInterval(function(){
           if(useTime<=0){endGame();return;}
           (useTime<=10000)? Tcont.style.color='red': null;
           let s=useTime/1000, sec=s%60, mins=s/60;
           let res=('0'+Math.floor(mins)).slice(-2)+':'+('0'+sec).slice(-2);
           Tcont.dataset.time=res;
           tTaken.style.width=((s/divTime)*100000)+'%'
           useTime-= 1000;
        }, 1000);
    }

    return {
        init(a, o){
          if(isArray(a) && isObj(o)){
            QST=a.slice();
            QST.forEach(function(e){types[e.t]=null;})
            start(o);
            return true;
        } 
          throw Error('Expected argument 1 to be of type Array and argument 2 to be of Object Literal!')
        },
    }
})()


