function createtextinput(id:string,label:string){
    return createinput(id,label,'text')
}

function createslider(id:string,label:string){
    return createinput(id,label,'range')
}

function createnumberinput(id:string,label:string){
    return createinput(id,label,'number')
}

function createbutton(id:string,text:string):HTMLButtonElement{
    var html = `<div style="padding: 3px;">
        <button id="${id}">${text}</button>
    </div>`
    return string2html(html) as HTMLButtonElement
}

function createcheckbox(id:string,label:string){
    return createinput(id,label,'checkbox')
}

function createinput(id:string,label:string,inputtype:string):HTMLInputElement{
    var html = `<div style="padding: 3px;">
        <label style="display:block;" for="${id}">${label}</label>
        <input id="${id}" type="${inputtype}">
    </div>`
    return string2html(html) as HTMLInputElement
}

// function string2html2(s:string):HTMLElement{
//     var el = document.createElement('div')
//     el.innerHTML = s
//     return el.firstChild as HTMLElement
// }