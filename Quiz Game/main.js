const Quiz=(function(){
    const captain={quiz: null};
    const objString=(e)=>Object.prototype.toString.call(e);
    const isObj=(e)=>(objString(e) === '[object Object]');
    const isFunc=(e)=>(objString(e) === '[object Function]');
    const isArray=(e)=>(objString(e) === '[object Array]');
    const extend=Object.assign;
    
    let QUESTIONS=null;

    const parentDiv=create('div');
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
  
   const a={
        number: null,
        useTime: 10000,
        type: 'Mathematics',
    }
    const watcher={
        __proto__:null,
        index: 0,
        useTime: false,
    }
    let total, time, divTime=1;
function Quiz(){
    let stack=[],
    numberofQuestions=null,
    type=null,
    score=0;
    
    QUESTIONS.forEach(function(e){types[e.t]=null;})

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
        let qP=stack[watcher.index];
        if(sel){qP.selected=sel.textContent}
    }
    
    function Next(){
        addSelected();
        clearInterval(time);
        let a;(watcher.index===total-1)? null:watcher.index+=1;
        (a=appFace.firstElementChild)? a.remove(): null;
        setTimeout(()=>{
            let v=stack[watcher.index];
            createQuestion(v);
        }, 500);
    }
    
    function Back(){
        addSelected();
        clearInterval(time);
        let a;(watcher.index===0)? null:watcher.index-=1;
        (a=appFace.firstElementChild)? a.remove(): null;
        setTimeout(()=>{
            let v=stack[watcher.index];
            createQuestion(v); 
        }, 500);
    }

    function createSltOptions(){
        stack.forEach((e, i)=>{
          const options=create('option');
          options.text=(i+1);
          sltBox.appendChild(options);
        });
     }

     function SubmitQuiz(){
            clearInterval(time);
            let end=confirm('Are you sure you want to submit? \nYou can still go through the quiz.');
            if(end){captain.quiz.endGame();return}
            doTime(watcher.useTime);
     }

     function changeSelect(){
        clearInterval(time);
        let sel=appFace.querySelector('.options .selected span');
        let qP=stack[watcher.index];
        if(sel){qP.selected=sel.textContent}
        let a;(watcher.index===0)? null:watcher.index-=1;
        (a=appFace.firstElementChild)? a.remove(): null;
        setTimeout(()=>{
           let v=stack[watcher.index];
           createQuestion(v); 
        }, 500);
        watcher.index=this.selectedIndex;
       }

    function clearValues(){
        nextBtn.removeEventListener('click', Next);
        backBtn.removeEventListener('click', Back);
        parentDiv.querySelector('#submit').removeEventListener('click', SubmitQuiz);
        sltBox.innerHTML=null;
        timeCont.style.color='white';
        stack=[],numberofQuestions=null,QUESTIONS=undefined,
        type=null,score=0,total=0, time=0, divTime=1, watcher.index=0, watcher.useTime=false;
    }

    function playAgain(){
            let modal=document.querySelector('#modal');
            modal.style.display='block';appFace.innerHTML=null;appFace.hidden=true;
            let startCont=document.querySelector('#app > .start');
            if(startCont.style.transform!=='translateX(0px)'){startCont.style.transform='translateX(0px)'}
            startCont.style.display='grid';setTimeout(()=>{modal.style.display='none'}, 1000);
    }
      return {
        __proto__:null, 
        
        start: function(o){
           if(!isObj(o)){return false}
           let c=extend({__proto__:null}, o);
           Object.keys(c).forEach(e=>{if(e in a){return} delete c[e]});
           watcher.useTime=(c.useTime!==false && !isNaN(c.useTime=parseInt(c.useTime)))? c.useTime: null;
           divTime=(watcher.useTime)? watcher.useTime: 1;
           watcher.endIfFail=!!c.endIfFail;
           type=(objString(c.type)==='[object String]')? c.type: null;
           numberofQuestions=(!!c.number && typeof c.number=='number')? c.number: QUESTIONS.length;
           createQuestionStack(QUESTIONS);
           appFace.hidden=false;
           parentDiv.querySelector('#submit').addEventListener('click', SubmitQuiz);
           nextBtn.addEventListener('click', Next);
           backBtn.addEventListener('click', Back);
           sltBox.addEventListener('change', changeSelect)
           createSltOptions();
           if(typeof watcher.useTime === 'number'){parentDiv.querySelector('.app-head').appendChild(timeCont);}
           createQuestion(stack[watcher.index]);
        },
        endGame: function(){
            clearInterval(time);
            captain.quiz=null;
            addSelected();
            stack.forEach((e, i)=>{if(e.selected===e.ans){score+=1;}})
            let modal=document.querySelector('#modal');
            modal.style.display='block';
            appFace.innerHTML=null;
            appFace.innerHTML=showResult();
            appFace.querySelector('#play-again').addEventListener('click', playAgain);
            clearValues();
            setTimeout(()=>{modal.style.display='none'}, 1000);
         }
    }
}
   const appFace=document.querySelector('#app-face');
   const backBtn=parentDiv.querySelector('#app-back');   
   const nextBtn=parentDiv.querySelector('#app-next');  
   const sltBox=parentDiv.querySelector('#quiz-switch');
   const timeCont=parentDiv.querySelector('.time-container');
   const timeTaken=parentDiv.querySelector('#time-taken');
   timeCont.remove();
   backBtn.remove();nextBtn.remove();
   
   /**@param {StringConstructor} e */
   function create(e){return document.createElement(e)};

   function createQuestion(o){
        const {q, opts, selected} = o;
        let alpha=['A', 'B', 'C', 'D', 'E'];
        const quest=parentDiv.querySelector('.question'); 
        const appFaceControl=parentDiv.querySelector('.app-face-control');
        const options=parentDiv.querySelector('.options');
        const qNo=parentDiv.querySelector('#q-no');
        options.innerHTML=null;
        sltBox.selectedIndex=watcher.index;
        qNo.textContent='Question '.concat(watcher.index+1);
        quest.textContent=(typeof q=='string')? q: '';
        (isObj(opts))?
           Object.values(opts).forEach((e, i)=>{
              let div=create('div');
              if(e===selected){div.className='selected'};
              div.innerHTML=alpha[i]+'.) <span>'+e+'</span>';
              div.addEventListener('click', function(){
              let a=parentDiv.querySelector('.selected');if(a){a.classList.remove('selected');} this.classList.add('selected');
            })
              options.appendChild(div);
           })
       : null;
       if(watcher.index===0){backBtn.remove()} else if(!appFaceControl.contains(backBtn) && appFaceControl.contains(nextBtn)){
           appFaceControl.insertBefore(backBtn, nextBtn)
       }
       if(watcher.index===total-1){nextBtn.remove()}
       else if(!appFaceControl.contains(nextBtn)) {appFaceControl.appendChild(nextBtn);}
       appFace.appendChild(parentDiv);
       if(typeof watcher.useTime === 'number'){doTime()};
    }
    
    function doTime(){
        time=setInterval(function(){
           if(watcher.useTime===0){captain.quiz.endGame();return;}
           if(watcher.useTime<=10000){timeCont.style.color='red';}
           let s=watcher.useTime/1000, seconds=s%60, minutes=s/60;
           let res=('0'+Math.floor(minutes)).slice(-2)+':'+('0'+seconds).slice(-2);
           timeCont.dataset.time=res;
           timeTaken.style.width=((s/divTime)*100000)+'%'
           watcher.useTime=watcher.useTime - 1000;
        }, 1000);
    }

    return {
        init(a, o){
          if(isArray(a) && isObj(o)){
            QUESTIONS=a.slice();
            captain.quiz=Quiz();
            captain.quiz.start(o);
            return true;
        } 
          throw Error('Expected argument 1 to be of type Array and argument 2 to be of Object Literal!')
        },
    }
})()


