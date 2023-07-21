(function () {
    const d = document;
    const isNum = (n) => typeof n === "number";
    const is = (n, e) => n instanceof e;
    const isObj = (n) => typeof n === "object";
    const addEv = (el, type, func, opt) => el.addEventListener(type, func, !!opt);
    const qs = (s) => d.querySelector(s);
    const ifUn = function (a, v) {
        return v === undefined ? a : a === undefined ? v : a;
    };
    const qsa = (s) => d.querySelectorAll(s);
    const create = document.createElement.bind(d);
    const slice = Function.prototype.call.bind(Array.prototype.slice);

    Element.prototype.qs = function (el) {
        return this.querySelector(el);
    };
    Element.prototype.qsa = function (el) {
        return this.querySelectorAll(el);
    };
    Element.prototype.insert = function () {
        let s = arguments;
        for (let i = 0; i < s.length; i++) {
            if (is(s[i], HTMLElement)) {
                this.appendChild(s[i]);
            }
        }
    };

    const List = new Map([
        ["default", []],
        ["created", []],
        ["completed", []],
        ["expired", []],
        ["urgent", []],
    ]);

    const gbChanges = [];
    const _undo = watchChange(gbChanges);
    let dragIconHeld = false;

    const global = {
        __proto__: null,
        sDlB: true,
        sDtB: true,
    };

    const observer = new MutationObserver(ContWatcher);
    observer.observe(qs(".list-container"), { childList: true });

    function dateLS(a) {
        return a.toLocaleDateString("en-UK", {
            weekday: "long",
            year: "numeric",
            month: "long",
            hour: "2-digit",
            day: "2-digit",
            hour12: false,
            minute: "2-digit",
            second: "2-digit",
        });
    }
    function ContWatcher(r, o) {
        for (const i of r) {
            if (i.type === "childList") {
                if (gbChanges.length > 0) {
                    if (!qs(".undo-holder") && !qs(".save-holder")) {
                        const div1 = create("div");
                        const div2 = create("div");
                        div1.className = "undo-holder";
                        div2.className = "save-holder";
                        div1.innerHTML = "<button>Undo</button>";
                        div2.innerHTML = "<button>Save</button>";
                        addEv(div1.qs("button"), "click", () => {
                            _undo(qs(".list-container"));
                        });
                        addEv(div2.qs("button"), "click", () => {
                            gbChanges.length = 0;
                            div1.style.left = "-250px";
                            div2.style.right = "-250px";
                            setTimeout(() => {
                                div1.remove();
                                div2.remove();
                            }, 300);
                            updateMap(slice(qsa(".list-item")));
                        });
                        qs("body").insert(div1, div2);
                        setTimeout(() => {
                            div1.style.left = window.innerWidth > 500 ? "10px" : "0px";
                            div2.style.right = window.innerWidth > 500 ? "10px" : "0px";
                        }, 50);
                    }
                } else if (qs(".undo-holder") && qs(".save-holder")) {
                    let a = qs(".undo-holder");
                    let b = qs(".save-holder");
                    a.style.left = "-250px";
                    b.style.right = "-250px";
                    setTimeout(() => {
                        a.remove();
                        b.remove();
                    }, 300);
                }
            }
        }
    }

    function sP(a, p) {
        if (isObj(p)) {
            Object.getOwnPropertyNames(p).forEach(function (e) {
                if (!isObj(p[e])) {
                    a[e] = p[e];
                    return;
                } else {
                    Object.getOwnPropertyNames(p[e]).forEach(function (v) {
                        a[e][v] = p[e][v];
                    });
                }
            });
        }
    }

    function changeTheme() {
        if (qs(".light-theme")) {
            sP(this, { textContent: "sunny", title: "Switch to Light mode" });
            qs(".light-theme").classList.remove("light-theme");
            return;
        }
        sP(this, { textContent: "dark_mode", title: "Switch to Dark mode" });
        qs("body").classList.add("light-theme");
    }

    async function createList() {
        let a = qs("#text-todo");
        if (a.value.trim() === "") {
            alert("Please enter some text!");
            a.focus();
            return;
        }
        let val = a.value.trim();
        let dfDate = new Date();
        dfDate.setDate(dfDate.getDate() + 7);
        let dd = global.sDtB ? await getDateModal() : dfDate.getTime();
        if (dd === false) {
            return;
        } else if (dd == "No!") {
            alert("You haven't closed the first modal window!");
            return;
        }
        let ndt = new Date().getTime();
        const li = create("div");
        sP(li, {
            className: "list-item",
            dataset: { tracker: rand(), created: ndt, due: dd },
            draggable: !0,
        });
        li.innerHTML = `<input type="checkbox" autocomplete="off"/>
        <span>${val}</span>
        <i class="material-symbols-outlined drag">drag_pan</i>
        <i class="material-symbols-outlined close">delete</i>`;
        addEv(li.qs(".close"), "click", delItem);
        addEv(li.qs("input"), "change", numSelect);
        addEv(li, "dragstart", dragStart);
        addEv(li, "dragenter", dragEnter);
        addEv(li, "dragover", dragMove);
        addEv(li, "drop", dropList);
        addEv(li.qs(".drag"), "mousedown", function () {
            dragIconHeld = !0;
            this.classList.add("grab");
        });
        addEv(li.qs(".drag"), "mouseup", function () {
            dragIconHeld = !1;
            this.classList.remove("grab");
        });
        a.value = "";
        a.focus();
        qs(".list-container").appendChild(li);
        updateMap(slice(qsa(".list-item")));
    }

    function applyFilter() {
        const e = this.dataset.value;
        if (List.has(e)) {
            let a = qs(".list-container");
            a.innerHTML = null;
            a.insert.apply(a, List.get(e));
        }
    }

    function updateMap(d) {
        List.set("default", d);
        List.set("created", doCreated(d));
        List.set("completed", doComp(d));
        List.set("expired", doExp(d));
        List.set("urgent", doImp(d));
    }

    function doCreated(d) {
        let a = d.slice();
        a.sort((a, b) => {
            return parseInt(a.dataset.tracker) > parseInt(b.dataset.tracker) ? 1 : -1;
        });
        return a;
    }

    function doExp(d) {
        return d.slice().filter((e) => {
            return e.classList.contains("exp");
        });
    }

    function doImp(d) {
        return d.slice().filter((e) => {
            return e.dataset.starred == "true";
        });
    }

    function doComp(d) {
        return d.slice().filter((e) => {
            return e.classList.contains("comp");
        });
    }

    function watchChange(arr) {
        return function (list) {
            if (is(arr[0], Array) && is(list, Element)) {
                if (isNum(arr[0][0])) {
                    makeChanges(arr, list);
                } else if (is(arr[0][0], Array)) {
                    let v = slice(arr[0]);
                    let l = arr[0].length;
                    for (let i = 0; i < l; i++) {
                        makeChanges(v, list);
                    }
                    arr.shift();
                }
            }
            updateMap(slice(qsa(".list-item")));
        };
    }

    function makeChanges(arr, list) {
        if (arr.length != 0) {
            if (list.children.length === 0) {
                list.appendChild(arr[0][1]);
                arr.shift();
            } else if (arr[0][0] === 0) {
                list.insertBefore(arr[0][1], list.children.item(0));
                arr.shift();
            } else if (
                arr[0][0] >= list.children.length &&
                list.children.length > 2
            ) {
                list.appendChild(arr[0][1]);
                arr.shift();
            } else {
                list.insertBefore(arr[0][1], list.children.item(arr[0][0]));
                arr.shift();
            }
        }
    }

    function toggleFltBox() {
        let a = qs("#filters");
        a.style.height = a.style.height === "0px" ? a.scrollHeight + "px" : "0px";
    }

    function rand() {
        function n() {
            let a = 4 + Math.floor(Math.random() * 5);
            const arr = [
                "a",
                "b",
                "c",
                "d",
                "e",
                "f",
                "g",
                "h",
                "i",
                "j",
                "k",
                "l",
                "m",
                "n",
                "o",
                "p",
                "q",
                "r",
                "s",
                "t",
                "u",
                "v",
                "w",
                "x",
                "y",
                "z",
                "A",
                "B",
                "C",
                "D",
                "E",
                "F",
                "G",
                "H",
                "I",
                "J",
                "K",
                "L",
                "M",
                "N",
                "O",
                "P",
                "Q",
                "R",
                "S",
                "T",
                "U",
                "V",
                "W",
                "X",
                "Y",
                "Z",
                "0",
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9",
            ];
            let r = "";
            let l = arr.length;
            for (let i = 0; i < a; i++) {
                r += arr[Math.floor(Math.random() * l)];
            }
            return r;
        }
        let s = n();
        while (
            qs('.list-item[data-tracker="' + s + '"') &&
            !gbChanges.some(prevOverFlow)
        ) {
            s = n();
        }
        return s;
    }

    const prevOverFlow = (e) => {
        if (isNum(e[0])) {
            return e[1].dataset.tracker === s;
        } else if (is(e[0], Array)) {
            return e[0].some((e) => {
                if (isNum(e[0])) {
                    return e[1].dataset.tracker === s;
                }
            });
        }
    };

    function pickFilter() {
        qs(".app-layer-6 .selected").classList.remove("selected");
        this.classList.add("selected");
        qs(".app-layer-6 .filter").textContent = this.textContent;
        qs("#filters").style.height = "0px";
    }

    function chkAll() {
        let a = qsa('.list-item [type="checkbox"]');
        if (this.checked) {
            a.forEach((e) => (e.checked = !0));
        } else {
            a.forEach((e) => (e.checked = !1));
        }
        numSelect();
    }
    function numSelect() {
        qs("#num-select").textContent = qsa(".list-item :checked").length;
    }
    function getDateModal() {
        if (!qs("#list-modal")) {
            let modal = create("div");
            modal.id = "list-modal";
            modal.innerHTML = `<div class="date-form">
        <h2>Set Your Due Date</h2>
        <div class="time">
          <div class="_ymd">
             <input type="number" id="date-year" placeholder="Year" /> <span>/</span> 
             <input type="number" id="date-month" placeholder="Month" /> <span>/</span>
             <input type="number" id="date-date" placeholder="Date" />
          </div>
          <div class="_hm">
           <input type="number" id="date-hour" placeholder="Hour" /> <span>/</span>
           <input type="number" id="date-min" placeholder="Minute" />
          </div>
        </div>
        <div class="no-date"><input type="checkbox" id="chk-no-date" /> <label for="chk-no-date"> Set my default due-date for 1 week. </label></div>
        <div><button class="date-close">CLOSE</button> <button class="date-save">SAVE</button></div>
      </div>`;
            qs("body").appendChild(modal);
            setTimeout(() => {
                modal.style.opacity = "1";
            }, 10);
            return new Promise((resolve) => {
                let saveBtn = modal.qs(".date-save");
                let closeBtn = modal.qs(".date-close");
                addEv(closeBtn, "click", function () {
                    modal.style.opacity = "0";
                    setTimeout(() => {
                        modal.remove();
                    }, 300);
                    resolve(false);
                });
                addEv(saveBtn, "click", () => {
                    saveDate(resolve);
                });
            });
        }
        return "No!";
    }

    addEv(qs(".filter"), "click", toggleFltBox);
    addEv(qs("#theme-cont"), "click", changeTheme);
    addEv(qs(".app-layer-2 .add-item"), "click", createList);
    addEv(qs("#text-todo"), "keypress", (e) => {
        e.key == "Enter" ? createList() : null;
    });
    qsa("#filters div").forEach((e) => addEv(e, "click", pickFilter));
    qsa("#filters div").forEach((e) => addEv(e, "click", applyFilter));
    addEv(qs("#chkAll"), "click", chkAll);
    addEv(qs(".app-layer-3 .close"), "click", delSelected);
    qsa(".list-item .close").forEach((e) => {
        addEv(e, "click", delItem);
    });
    qsa(".list-item input").forEach((e) => {
        addEv(e, "change", numSelect);
    });
    qsa(".list-item").forEach((e) => {
        addEv(e, "dragstart", dragStart);
        addEv(e, "dragenter", dragEnter);
        addEv(e, "dragover", dragMove);
        addEv(e, "drop", dropList);
        addEv(e.qs(".drag"), "mousedown", function () {
            dragIconHeld = !0;
            this.classList.add("grab");
        });
        addEv(e.qs(".drag"), "mouseup", function () {
            dragIconHeld = !1;
            this.classList.remove("grab");
        });
    });

    let c = qsa('.list-item [type="checkbox"]');

    function saveDate(resolve) {
        const a = qs("#list-modal");
        let date = new Date();
        let yy = parseInt(a.qs("#date-year").value) || date.getFullYear();
        let mt = parseInt(a.qs("#date-month").value) - 1 || date.getMonth();
        let dd = parseInt(a.qs("#date-date").value) || date.getDate() + 7;
        let hh = parseInt(a.qs("#date-hour").value) || date.getHours();
        let mn = parseInt(a.qs("#date-min").value) || date.getMinutes();
        date = new Date(yy, mt, dd, hh, mn);
        let xDate = new Date();
        xDate.setDate(xDate.getDate() + 1);
        if (xDate.getTime() > date.getTime()) {
            alert("You must save a date that is greater than 1 day!");
        } else {
            a.style.opacity = "0";
            setTimeout(() => {
                a.remove();
            }, 300);
            a.qs("#chk-no-date").checked ? (global.sDtB = !1) : null;
            resolve(date.getTime());
        }
    }

    async function delSelected() {
        let c = qsa(".list-item input:checked");
        if (c.length) {
            let a = [];
            if (global.sDlB) {
                let rs = await showDelModal();
                rs
                    ? (c.forEach((e) => {
                        let l = e.parentElement;
                        e.checked = false;
                        a.unshift([slice(qsa(".list-item")).indexOf(l), l]);
                        l.remove();
                    }),
                        gbChanges.unshift(a),
                        (qs(".app-layer-3 input").checked = false),
                        numSelect(),
                        updateMap(slice(qsa(".list-item"))))
                    : null;
            } else {
                c.forEach((e) => {
                    let l = e.parentElement;
                    e.checked = false;
                    a.unshift([slice(qsa(".list-item")).indexOf(l), l]);
                    l.remove();
                });
                gbChanges.unshift(a);
                qs(".app-layer-3 input").checked = false;
                numSelect();
                updateMap(slice(qsa(".list-item")));
            }
        }
    }

    async function delItem() {
        let a = this.parentElement;
        let p = qsa(".list-item");
        if (global.sDlB) {
            let rs = await showDelModal();
            rs
                ? (gbChanges.unshift([slice(p).indexOf(a), a]),
                    a.remove(),
                    numSelect(),
                    updateMap(slice(qsa(".list-item"))))
                : null;
        } else {
            gbChanges.unshift([slice(p).indexOf(a), a]);
            a.remove();
            numSelect();
            updateMap(slice(qsa(".list-item")));
        }
    }

    function showDelModal() {
        if (!qs("#list-modal")) {
            let modal = create("div");
            modal.id = "list-modal";
            modal.innerHTML = ` <div class="del-cont">
        <div>
           <span>Are you sure you want to delete this item?</span>
        </div>
        <div class="never-h">
           <input type="checkbox" id="never" /> <label for="never">I do not want to see this message again.</label>
        </div>
        <div style="display: flex;justify-content: space-around;">
           <button class="del-confirm">CONFIRM</button>
           <button class="del-cancel">CANCEL</button>
        </div>
      </div>`;
            qs("body").appendChild(modal);
            setTimeout(() => {
                modal.style.opacity = "1";
            }, 10);
            return new Promise((resolve) => {
                let saveBtn = modal.qs(".del-confirm");
                let closeBtn = modal.qs(".del-cancel");
                addEv(closeBtn, "click", function () {
                    modal.style.opacity = "0";
                    setTimeout(() => {
                        modal.remove();
                    }, 300);
                    resolve(false);
                });
                addEv(saveBtn, "click", () => {
                    resolve(true);
                    qs("#list-modal #never") && qs("#list-modal #never").checked
                        ? (global.sDlB = !1)
                        : null;
                    modal.style.opacity = "0";
                    setTimeout(() => {
                        modal.remove();
                    }, 300);
                });
            });
        }
        return "No!";
    }

    function dragStart(e) {
        if (dragIconHeld) {
            let num = slice(qs(".list-container").children).indexOf(e.currentTarget);
            e.dataTransfer.setData("text/plain", num);
        } else {
            e.preventDefault();
        }
    }
    function dragEnter(e) {
        e.preventDefault();
    }
    function dragMove(e) {
        e.preventDefault();
    }
    function dropList(e) {
        e.dataTransfer.dropEffect = "move";
        const num = parseInt(e.dataTransfer.getData("text/plain"));
        if (!isNaN(num) && num !== -1) {
            const c = qs(".list-container").children.item(num);
            c.qs(".drag").classList.remove("grab");
            if (c === e.currentTarget) {
                return;
            }
            c.remove();
            qs(".list-container").insertBefore(c, e.currentTarget);
        }
        updateMap(slice(qsa(".list-item")));
        e.dataTransfer.clearData("text/plain");
    }
    updateMap(slice(qsa(".list-item")));
})();
