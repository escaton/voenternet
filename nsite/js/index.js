var Builder = function() {
    return {

        wrapper: null,

        elements: new Array(),

        _map: new Array(),

        width: 0,
        height: 0,

        types: [
            {size: 's', r: 2},
            {size: 'm', r: 3},
            {size: 'l', r: 5}
        ],

        squares: new Array(),

        init: function (wrapper, generate, preview) {

            this.count = postList.length;
            this.wrapper = wrapper;
            this.preview = preview;

            this.width = Math.floor(wrapper.width()/50);

            for (var i=0;i<this.width;i++) this._map[i] = new Array();

            this.squares = (function(count) {
                var buf = [],
                    i = 0;

                // create proportional array
                for (i=0;i<count;i++) {
                    buf.push({
                        type: (i<count/2 ? '0' : (i<count*5/6 ? '1': '2'))
                    })
                }

                // Randomize array
                for (i = buf.length - 1; i > 0; i--) {
                    var j = Math.floor(Math.random() * (i + 1));
                    var temp = buf[i];
                    buf[i] = buf[j];
                    buf[j] = temp;
                }

                return buf;
            })(this.count)

            this.elements = (function(that) {
                var buf = [],
                    elem,prevHTML,
                    size,type;

                if (generate !== undefined) {
                    for (var i=0;i<that.count;i++) {
                        size = generate[that.squares[i].type];
                        type = size.content[Math.floor(Math.random() * size.content.length)];
                        elem = type.html;
                        elem = elem
                            .replace(/##IMG##/g, 'http://ipraaf.t.voenternet.ru/thumb/'+postList[i].id+'_'+type.thumb+'.png')
                            .replace(/##TITLE##/g, postList[i].title)
                            .replace(/##TXT##/g, postList[i].text[0].substr(0,size.size*15)+'...')

                        prevHTML = that.preview.html
                            .replace(/##IMG##/g, 'http://ipraaf.t.voenternet.ru/thumb/'+postList[i].id+'_'+that.preview.thumb+'.png')
                            .replace(/##TITLE##/g, postList[i].title)
                            .replace(/##TXT##/g, postList[i].text[0])

                        buf.push({
                            elem: $(elem).append($(prevHTML)),
                            params: {x:null, y:null, r: size.size}
                        })
                    }
                } else {
                    var blocks = wrapper.children();
                    for (var i=0;i<blocks.length;i++) {
                        buf.push({elem: blocks.eq(i), params: {x:null, y:null}})
                        buf[i].params.r = blocks.eq(i).hasClass('rb_sq3') ? 3 : (blocks.eq(i).hasClass('rb_sq2') ? 2 : 1)
                    }
                }

                return buf;
            })(this);

            wrapper.html('');
        },

        check: function (x, y, r) {
            if (x<0 || y<0) return false;
            for (var i=x;i<x+r;i++) {
                for (var j=y;j<y+r;j++) {
                    if (!this._map[i] || (this._map[i][j] !== undefined)) return false;
                }
            }
            return true;
        },

        set: function (x, y, r, elem) {
            for (var i=x;i<x+r;i++) {
                for (var j=y;j<y+r;j++) {
                    this._map[i][j] = elem;
                }
            }
        },

        clean: function (x, y, r) {
            for (var i=x;i<x+r;i++) {
                for (var j=y;j<y+r;j++) {
                    this._map[i][j] = undefined;
                }
            }
        },

        findSpace: function (r) {
            var map = this._map;

            for (var j=0;j<this.height-r;j++) {
                for (var i=0;i<this.width;i++) {
                    if (this.check(i,j,r)) {
                        return {x: i, y: j}
                    }
                }
            }
            return false;
        },

        allTop: function () {
            var map = this._map,
                i=0,j=0,
                counter=0,
                elements = this.elements;

            for (j=0;j<this.height;j++) {
                for (i=0;i<this.width;i++) {
                    
                    if (map[i][j] && !map[i][j].up) {
                        var sqr = map[i][j],
                            j1 = j,
                            h = 0;

                        this.clean(sqr.params.x, sqr.params.y, sqr.params.r);
                        while (this.check(i,j1-1,sqr.params.r)) {
                            h++;
                            j1--;
                            counter++;
                        }
                        this.set(sqr.params.x, sqr.params.y-h, sqr.params.r, sqr);
                        sqr.params.y = sqr.params.y-h;
                        sqr.elem.css({top:sqr.params.y*50,left:sqr.params.x*50});
                        sqr.up = true;
                    }
                }
            }
            for (i=0;i<elements.length;i++) elements[i].up = false;
            return counter;
        },

        allLeft: function () {
            var map = this._map,
                i=0,j=0,
                counter=0,
                elements = this.elements;

            for (i=0;i<this.width;i++) {
                for (j=0;j<this.height;j++) {

                    if (map[i][j] && !map[i][j].left) {
                        var sqr = map[i][j],
                            i1 = i,
                            l = 0;

                        this.clean(sqr.params.x, sqr.params.y, sqr.params.r);
                        while (this.check(i1-1,j,sqr.params.r)) {
                            l++;
                            i1--;
                            counter++;
                        }
                        this.set(sqr.params.x-l, sqr.params.y, sqr.params.r, sqr);
                        sqr.params.x = sqr.params.x-l;
                        sqr.elem.css({top:sqr.params.y*50,left:sqr.params.x*50});
                        sqr.left = true;
                    }
                }
            }
            for (i=0;i<elements.length;i++) elements[i].left = false;
            return counter;
        },

        shift: function (l,h) {
            var map = this._map,
                elements = this.elements,
                i,j,temp;

            for (i=0;i<this.width;i++) {
                for (j=l;j<this.height;j++) {
                    temp = map[i][j];
                    if (temp && !temp.shifted) {
                        temp.shifted = true;
                        temp.params.y = temp.params.y+h;
                        temp.elem.css({top:temp.params.y*50})
                    }
                }
            }
            for (i=0;i<elements.length;i++) elements[i].shifted = false;
            this.buildMap();

            this.height = this.getHeight();
        },

        buildMap: function () {
            var elements = this.elements,
                i,j;

            for (i=0;i<this.width;i++) this._map[i] = new Array();
            for (i=0;i<elements.length;i++) 
                this.set(
                    elements[i].params.x,
                    elements[i].params.y,
                    elements[i].params.r,
                    elements[i]
                );
        },

        open: function (index) {


            var elements = this.elements,
                elem = elements[index],
                i,
                temp;


            this.wrapper
                .find('.rb_sq8 .rb_padding')
                .show(0);

            this.wrapper
                .find('.rb_sq8 .preview')
                .hide(0)

            this.wrapper
                .find('.rb_sq8')
                .removeClass('rb_sq8')

            elem.elem.find('.rb_padding').hide(0);
            elem.elem.find('.preview').show(0);


            for (i=0;i<elements.length;i++) {
                elements[i].params.r = elements[i].init_params.r;
            }

            for (i=0;i<this.width;i++) this._map[i] = new Array();

            if (elem.params.x>this.width-8) elem.params.x = this.width-8;
            elem.params.r = 8;
            this.set(elem.params.x, elem.params.y, elem.params.r, elem)
            elem.elem.addClass('rb_sq8');


            this.height = Infinity;
            for (i=0;i<elements.length;i++) {
                if (i != index) {
                    temp = this.findSpace(elements[i].params.r)
                    elements[i].params = {x: temp.x, y: temp.y, r: elements[i].params.r}
                    this.set(temp.x, temp.y, elements[i].params.r, elements[i]);
                }
                elements[i].elem
                    .css({top:elements[i].params.y*50,left:elements[i].params.x*50})
            }

            this.height = this.getHeight();
            this.wrapper.height((this.height)*50);

            this.allTop()

            this.height = this.getHeight();
            this.wrapper.height((this.height)*50);

        },

        getHeight: function () {
            var elements = this.elements,
                i,h=0;

            for (i=0;i<elements.length;i++) {
                h = Math.max(h, elements[i].params.y+elements[i].params.r)
            }
            return h;
        },

        build: function (wrapper, generate, preview) {

            if (wrapper === undefined) return;

            this.init(wrapper, generate, preview);

            if (this.width < 5) return;

            var x=0,y=0,max=0,
                i=0,j=0,
                temp,type,
                map = this._map,
                elements = this.elements;

            // Расставляем первый раз
            this.height = Infinity;
            for (i=0;i<elements.length;i++) {

                temp = this.findSpace(elements[i].params.r)
                elements[i].params = {x: temp.x, y: temp.y, r: elements[i].params.r}
                this.set(temp.x, temp.y, elements[i].params.r, elements[i]);
                elements[i].elem
                    .css({top:temp.y*50,left:temp.x*50})
                    .appendTo(this.wrapper);
            }

            // сохраняем начальное положение
            for (i=0;i<elements.length;i++) {
                elements[i].init_params = {};
                elements[i].init_params.x = elements[i].params.x;
                elements[i].init_params.y = elements[i].params.y;
                elements[i].init_params.r = elements[i].params.r;
            }

            this.height = this.getHeight();
            wrapper.height(this.height*50);

            // this.open(0)
        }
    }
}


$(function() {
    
    // $('.r_block').css({width:'740px'});
    // $('.r_block .rb_blocks').css({width: 'auto'})
    // $('.r_block .rb_blocks').css({'margin-right': '-5px'})


    cBlocks = new Builder(),
    rBlocks = new Builder();

    cBlocks.build($('.l_block .rb_blocks'))
    rBlocks.build($('.r_block .rb_blocks'), [
        {
            size: 2,
            content: [
                {
                    thumb: 'min',
                    html: '<li class="rb rb_sq2 rb_grey" style="top: 2225px;"><div class="rb_padding"><a href="#"><img alt="_img7" src="##IMG##"><em class="title_bottom">##TXT##</em></a></div></li>'
                }
            ]
        },
        {
            size: 3,
            content: [
                {
                    thumb: 'min',
                    html: '<li class="rb rb_sq3 rb_bg" style="top: 1825px;"><div class="rb_padding"><a href="#"><img alt="_img7" src="##IMG##"><span class="rb_cont"><strong>##TITLE##</strong>##TXT##</span></a></div></li>'
                },
                {
                    thumb: 'min',
                    html: '<li class="rb rb_sq3" style="top: 1675px;"><div class="rb_padding"><a href="#"><img alt="_img7" src="##IMG##"></a></div></li>'
                }
            ]
        },
        {
            size: 5,
            content: [
                {
                    thumb: 'min',
                    html: '<li class="rb rb_sq5 rb_ips rb_grey" style="top: 1000px;"><div class="rb_padding"><img alt="_img5" src="##IMG##"><p><strong>##TITLE##</strong>##TXT##</p></div></li>'
                },
                {
                    thumb: 'med',
                    html: '<li class="rb rb_sq5 rb_grey rb_ti" style="top: 500px;"><div class="rb_padding"><h1>##TITLE##</h1><a href="#"><img alt="_img7" src="##IMG##"></a></div></li>'
                },
                {
                    thumb: 'med',
                    html: '<li class="rb rb_sq5 rb_grey rb_ti" style="top: 750px;"><div class="rb_padding"><a href="#"><img alt="_img7" src="##IMG##"></a><h1>##TITLE##</h1></div></li>'
                },
                {
                    thumb: 'med',
                    html: '<li class="rb rb_sq5 rb_bg" style="top: 250px;"><div class="rb_padding"><a href="#"><img alt="_img7" src="##IMG##"><span class="marker"></span><span class="rb_cont">##TXT##</span></a></div></li>'
                }
            ]
        }
    ], {
        thumb: 'max',
        html: '<div class="rb_padding preview" style="display:none"><img alt="_img13" src="##IMG##">'+
                    '<h1>##TITLE##</h1>'+
                    '<div class="marker"></div>'+
                    '<ul class="menu_cont"><li class="red"><a href="#">страница</a></li><li><a href="#">бирка</a></li><li><a href="#">архив</a></li></ul>'+
                    '<p>##TXT##</p>'+
                    '<div class="block_info">'+
                        '<div class="l"><img alt="_img" src="nsite/img/_img.jpg"></div>'+
                        '<div class="r">'+
                            '<em>отзыв<strong>00519</strong></em>'+
                            '<em>просмотр<strong>01325</strong></em>'+
                            '<em>показатель<strong class="color">+00000</strong></em>'+
                        '</div>'+
                        '<div class="clear"></div>'+
                    '</div>'+
                '</div>'
    })

    $('.r_block .rb_blocks ')
        .click(function() {
            rBlocks.open($('.r_block .rb_blocks ').index(this))
            return false;
        })
})


// $(function() {
//     $('.button')
//         .click(function() {
//             builder.build($('.wrapper'))

//             $('.block')
//                 .click(function() {
//                     builder.open($('.block').index(this))
//                 })
//         })
//         .trigger('click');
// })