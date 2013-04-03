function preview_chaos() {
   return $(".preview_chaos.active").hasClass('preview_chaos_1');
}


function prepareList(listNow,curId) {
    if (typeof curId != 'undefined' && curId) {
        for (var i in listNow) {
            if (listNow[i].id == curId) {
                listNow.splice(i,1);
            }
        }
    }

    return listNow;
}


var Builder = function() {
    return {
        generate: null,
        previewList: [],
        fixSize: false,
        wrapper: null,
        elements: new Array(),
        _map: new Array(),
        width: 0,
        height: 0,

/*
        types: (
            preview_chaos()
           ? [
                {size: 's', r: 2},
                {size: 'm', r: 3},
                {size: 'l', r: 5}
            ]
           :[
                {size: 'm', r: 3}
            ]
        ),
*/

        squares: new Array(),

        init: function () {

            this.count = this.previewList.length;

            this.width = Math.floor(this.wrapper.width()/50);

            for (var i=0;i<this.width;i++) this._map[i] = new Array();

            this.squares = (function(count,fixSize) {
                var buf = [],
                    i = 0;

                for (var i=0;i<count;i++) {
                    buf.push({
                        type: fixSize?fixSize:(i<count/2 ? '0' : (i<count*5/6 ? '1': '2'))
                    })
                }

                // Randomize array
                for (var i = buf.length - 1; i > 0; i--) {
                    var j = Math.floor(Math.random() * (i + 1));
                    var temp = buf[i];
                    buf[i] = buf[j];
                    buf[j] = temp;
                }

                return buf;
            })(this.count,this.fixSize)
            this.elements = (function(that) {
                var buf = [],
                    elem,prevHTML,
                    size,type;

                if (that.generate !== undefined) {
                    for (var i=0;i<that.count;i++) {
                        size = that.generate[that.squares[i].type];

                        type = size.content[Math.floor(Math.random() * size.content.length)];
                        elem = type.html;
                        prevHTML = that.preview[0].html;
/*
                        elem = elem
                            .replace(/##IMG##/g, 'http://ipraaf.t.voenternet.ru/uploads/thumb/'+cur_blog.id+'_'+that.previewList[i].id+'_'+type.thumb+'.png')
                            .replace(/##title##/g, that.previewList[i].title)
                            .replace(/##text##/g, that.previewList[i].text[0])//.substr(0,size.size*15)+'...'
                            .replace(/##url##/g, that.previewList[i].url)

                        prevHTML = prevHTML
                            .replace(/##IMG##/g, 'http://ipraaf.t.voenternet.ru/uploads/thumb/'+cur_blog.id+'_'+that.previewList[i].id+'_'+that.preview[0].thumb+'.png')
                            .replace(/##title##/g, that.previewList[i].title)
                            .replace(/##text##/g, that.previewList[i].text[0])
                            .replace(/##url##/g, that.previewList[i].url)
                            .replace(/##blog_abr##/g   , typeof that.previewList[i].blog_abr   == 'undefined'  ? cur_blog.abr   : that.previewList[i].blog_abr)
                            .replace(/##LABEL_THEME##/g , typeof that.previewList[i].blog_theme == 'undefined'  ? cur_blog.theme : that.previewList[i].blog_abr)
                            .replace(/##COUNTER_RATING##/g, that.previewList[i].counter.rating)
                            .replace(/##COUNTER_COMMENT##/g, that.previewList[i].counter.comment)
                            .replace(/##COUNTER_VIEW##/g, that.previewList[i].counter.view)
*/


                        if (!that.previewList[i].thumb) {
                            elem = elem.replace(new RegExp('##IMG##','g'),'');
                            prevHTML = prevHTML.replace(new RegExp('##IMG##','g'),'');
                        }
                        for (var name in that.previewList[i]) {
                            if (typeof that.previewList[i][name] == 'object') {
                                if (typeof that.previewList[i][name][0] =='undefined') {
                                    // @todo recursive. пока 2уровневый макс
                                    for (var nameSub in that.previewList[i][name]) {
                                        elem = elem.replace(new RegExp('##'+name+'_'+nameSub+'##','g'),that.previewList[i][name][nameSub]);
                                        prevHTML = prevHTML.replace(new RegExp('##'+name+'_'+nameSub+'##','g'),that.previewList[i][name][nameSub]);
                                    }
                                } else {
                                    // @todo просчёт размера стринга
                                    elem = elem.replace(new RegExp('##'+name+'##','g'),that.previewList[i][name][0]);
                                    prevHTML = prevHTML.replace(new RegExp('##'+name+'##','g'),that.previewList[i][name][0]);
                                }
                            } else {
                                elem = elem.replace(
                                    new RegExp('##'+name+'##','g'),
                                    that.previewList[i][name]
                                );
                                prevHTML = prevHTML.replace(
                                    new RegExp('##'+name+'##','g'),
                                    that.previewList[i][name]
                                );
                            }
                        }
                        elem = elem.replace(/##type_thumb##/g, type.thumb);
                        prevHTML = prevHTML.replace(/##type_thumb##/g, that.preview[0].thumb);
                        if (0) {//@dbg
                            var tmp_dbg = elem.match(/##.{0,20}##/,'g');
                            if (tmp_dbg) {
                                console.log('tmpl elem not null:')
                                console.log(elem.match(/##.{0,20}##/,'g'))
                            }
                            tmp_dbg = prevHTML.match(/##.{0,20}##/,'g');
                            if (tmp_dbg) {
                                console.log('tmpl prevHTML not null:')
                                console.log(prevHTML.match(/##.{0,20}##/,'g'))
                            }
                        }
                        elem = elem.replace(/##.{0,20}##/,'','g');
                        prevHTML = prevHTML.replace(/##.{0,20}##/,'','g');
                        buf.push({
                            elem: $(elem).append($(prevHTML)),
                            params: {
                                x:null,
                                y:null,
                                r: size.size
                            }
                        })

                    }
                } else {
                    var blocks = this.wrapper.children();
                    for (var i=0;i<blocks.length;i++) {
                        buf.push({elem: blocks.eq(i), params: {x:null, y:null}});
                        buf[i].params.r = blocks.eq(i).hasClass('rb_sq3') ? 3 : (blocks.eq(i).hasClass('rb_sq2') ? 2 : 1);
                    }
                }
                return buf;
            })(this);

            this.wrapper.html('');
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

            for (var j=0;j<this.height;j++) {
                for (var i=0;i<this.width;i++) {

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
            for (var i=0;i<elements.length;i++) elements[i].up = false;
            return counter;
        },

        allLeft: function () {
            var map = this._map,
                i=0,j=0,
                counter=0,
                elements = this.elements;

            for (var i=0;i<this.width;i++) {
                for (var j=0;j<this.height;j++) {

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
            for (var i=0;i<elements.length;i++) elements[i].left = false;
            return counter;
        },

        shift: function (l,h) {
            var map = this._map,
                elements = this.elements,
                i,j,temp;

            for (var i=0;i<this.width;i++) {
                for (var j=l;j<this.height;j++) {
                    temp = map[i][j];
                    if (temp && !temp.shifted) {
                        temp.shifted = true;
                        temp.params.y = temp.params.y+h;
                        temp.elem.css({top:temp.params.y*50})
                    }
                }
            }
            for (var i=0;i<elements.length;i++) elements[i].shifted = false;
            this.buildMap();

            this.height = this.getHeight();
        },

        buildMap: function () {
            var elements = this.elements,
                i,j;

            for (var i=0;i<this.width;i++) this._map[i] = new Array();
            for (var i=0;i<elements.length;i++)
                this.set(
                    elements[i].params.x,
                    elements[i].params.y,
                    elements[i].params.r,
                    elements[i]
                );
        },

        open: function (index) {
            previewId = 0;
            if (this.width < this.preview[0].size) {
                window.location.href = this.previewList[index].url
                return;
            }

            var elements = this.elements,
                elem = elements[index],
                i,
                temp;
            this.wrapper
                .find('.rb_sq'+this.preview[0].size+' .rb_padding')
                .show(0);

            this.wrapper
                .find('.rb_sq'+this.preview[0].size+' .preview')
                .hide(0);

            this.wrapper
                .find('.rb_sq'+this.preview[0].size)
                .removeClass('rb_sq'+this.preview[0].size);
            //перенёс снизу, чтобы по кликам не прыгала картинка от паддингов
            elem.elem.addClass('rb_sq'+this.preview[0].size);
            elem.elem.find('.rb_padding').hide(0);
            elem.elem.find('.preview').show(0);

            for (var i=0;i<elements.length;i++) {
                elements[i].params.r = elements[i].init_params.r;
            }

            for (var i=0;i<this.width;i++) this._map[i] = new Array();

            if (elem.params.x>this.width-this.preview[0].size) elem.params.x = this.width-this.preview[0].size;
            elem.params.r = this.preview[0].size;
            this.set(elem.params.x, elem.params.y, elem.params.r, elem)

            this.height = Infinity;
            for (var i=0;i<elements.length;i++) {
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

            for (var i=0;i<elements.length;i++) {
                h = Math.max(h, elements[i].params.y+elements[i].params.r)
            }
            return h;
        },

        build: function () {

            if (this.wrapper.length === 0) return;

            this.init();

            if (this.width < 5) return;

            var x=0,y=0,max=0,
                i=0,j=0,
                temp,type,
                map = this._map,
                elements = this.elements;

            // Расставляем первый раз
            this.height = Infinity;
            for (var i=0;i<elements.length;i++) {

                temp = this.findSpace(elements[i].params.r)
                elements[i].params = {x: temp.x, y: temp.y, r: elements[i].params.r}
                this.set(temp.x, temp.y, elements[i].params.r, elements[i]);
                elements[i].elem
                    .css({top:temp.y*50,left:temp.x*50})
                    .appendTo(this.wrapper);
            }

            // сохраняем начальное положение
            for (var i=0;i<elements.length;i++) {
                elements[i].init_params = {};
                elements[i].init_params.x = elements[i].params.x;
                elements[i].init_params.y = elements[i].params.y;
                elements[i].init_params.r = elements[i].params.r;
            }

            this.height = this.getHeight();
            this.wrapper.height(this.height*50);
        }
    }
}

function rebuild_label() {
    lBlocks = new Builder();
    lBlocks.zoomWidthSize = 5;
    lBlocks.wrapper = $($('.rb_blocks')[0]);
    lBlocks.previewList = prepareList(blogList,cur_blog.id);


    lBlocks.generate = [
        {
            size: 1,
            content: [
                {
                    thumb: 'min',
                    html: '<li class="rb rb_cb label_theme label_theme_##label_theme##"><div class="rb_padding">##name_short##</div></li>'
                }
            ]
        },
        {
            size: 2,
            content: [
                {
                    thumb: 'min',
                    html: '<li class="rb rb_cb rb_sq2 label_theme label_theme_##label_theme##">' +
                        '<div class="rb_padding">' +
                        '<h3>##name##</h3>' +
                        '<div class="marker"></div>' +
                        '<em><a href="#">содержание</a></em>' +
                        '<h1>##name_short##</h1>' +
                        '</div>' +
                        '</li>'
                }
            ]
        },
        {
            size: 3,
            content: [
                {
                    thumb: 'min',
                    html:'<li class="rb rb_cb label_theme label_theme_##label_theme## rb_sq3">' +
                        '<div class="rb_padding">' +
                        '<h1>##name_short##</h1>' +
                        '<p><strong>##name##</strong><em>##about##</em></p>' +
                        '<div class="marker"></div>' +
                        '<em><a href="#">содержание</a></em>' +
                        '<div class="info_block">' +
                        '<em>показатель <strong class="color">+00057</strong></em>' +
                        '<em>текст <strong>##TEXT##</strong></em>' +
                        '<em>фото <strong>##PHOTO##</strong></em>' +
                        '<em>видео <strong>##VIDEO##</strong></em>' +
                        '</div>' +
                        '</div>' +
                        '</li>'
                }
            ]
        }
    ];

    lBlocks.preview = [{
        thumb: 'max',
        size: 5,
        html: '<div style="display:none;" class="block_label preview" onclick="document.location=\'##OWNER_LINK##\'">' +
            '<img src="/uploads/label/##id##.jpg" alt="##name##">' +
            '<h3>##name##</h3>' +
            '<h4><em>##about##</em></h4>' +
            '<div class="marker"></div>' +
            '<ul>' +
            '<li><a href="#">содержание</a></li>' +
            '<li><a href="#">подписка</a></li>' +
            '</ul>' +
            '<h1>##name_short##</h1>' +
            '<em>показатель <strong class="color">+##RATING##</strong><br>текст <strong>##TEXT##</strong> фото <strong>##PHOTO##</strong> видео <strong>##VIDEO##</strong></em>' +
            '<p>##description##</p>' +
            '</div>'
    }];



    lBlocks.build();
    lBlocks.wrapper.find('.rb')
        .click(function() {
            lBlocks.open($(lBlocks.wrapper[0].childNodes).index(this))
            return false;
        })
}


function rebuild_preview() {
    rBlocks = new Builder();
    rBlocks.wrapper = $('.r_block .rb_blocks');

    for (var i in postList) {
        postList[i].IMG =  '/uploads/thumb/'+cur_blog.id+'_'+postList[i].id+'_##type_thumb##.png';
        if (typeof postList[i].blog_abr   == 'undefined')
            postList[i].blog_abr =  cur_blog.abr;
    }

    rBlocks.previewList = prepareList(postList,curPostId);
    rBlocks.fixSize = (
        preview_chaos()
        ? false
        : 2
    );/*($(wrapper).width()<500?*/2/*)*/

    rBlocks.preview = [{
        thumb: 'max',
        size: 8,
        html: '<div class="rb_padding preview" style="display:none;" onclick="document.location=\'##url##\'">' +
            '<img alt="##title##" src="##IMG##" >'+
            '<h1>##title##</h1>'+
            '<div class="marker"></div>'+
            '<ul class="menu_cont"><li class="red"><a href="#">страница</a></li><li><a href="#">бирка</a></li><li><a href="#">архив</a></li></ul>'+
            '<p>##text##</p>'+
            '<div class="block_info">'+
            '<div class="l rb_cb label_theme_##LABEL_THEME##">##blog_abr##</div>'+
            '<div class="r">'+
            '<em>отзыв<strong>##COUNTER_COMMENT##</strong></em>'+
            '<em>просмотр<strong>##COUNTER_VIEW##</strong></em>'+
            '<em>показатель<strong class="color">##COUNTER_RATING##</strong></em>'+
            '</div>'+
            '<div class="clear"></div>'+
            '</div>'+
            '</div>'
    }];
    rBlocks.generate = [
        {
            size: 2,
            content: [
                {
                    thumb: 'min',
                    html: '<li class="rb rb_sq2 rb_grey" style="top: 2225px;"><div class="rb_padding"><img alt="##title##" src="##IMG##"><em class="title_bottom">##text##</em></div></li>'
                }
            ]
        },
        {
            size: 3,
            content: [
                {
                    thumb: 'min',
                    html: '<li class="rb rb_sq3 rb_bg" style="top: 1825px;"><div class="rb_padding"><div class="overhide h84 mb5"><img alt="##title##" src="##IMG##"></div><span class="rb_cont"><strong>##title##</strong>##text##</span></div></li>'
                },
                {
                    thumb: 'min',
                    html: '<li class="rb rb_sq3" style="top: 1675px;"><div class="rb_padding"><img alt="##title##" src="##IMG##"></div></li>'
                }
            ]
        },
        {
            size: 5,
            content: [
                {
                    thumb: 'min',
                    html: '<li class="rb rb_sq5 rb_ips rb_grey" style="top: 1000px;"><div class="rb_padding" style="padding-top:10px"><img alt="##title##" src="##IMG##"><p><strong>##title##</strong>##text##</p></div></li>'
                },
                {
                    thumb: 'med',
                    html: '<li class="rb rb_sq5 rb_grey rb_ti" style="top: 500px;"><div class="rb_padding"><h1>##title##</h1><img alt="##title##" src="##IMG##"></div></li>'
                },
                {
                    thumb: 'med',
                    html: '<li class="rb rb_sq5 rb_grey rb_ti" style="top: 750px;"><div class="rb_padding"><img alt="##title##" src="##IMG##"><h1>##title##</h1></div></li>'
                },
                {
                    thumb: 'med',
                    html: '<li class="rb rb_sq5 rb_bg" style="top: 250px;"><div class="rb_padding"><img alt="##title##" src="##IMG##"><span class="marker"></span><span class="rb_cont">##text##</span></div></li>'
                }
            ]
        }
        ];
    rBlocks.build( )

    rBlocks.wrapper.find('.rb')
        .click(function() {
            rBlocks.open($(rBlocks.wrapper[0].childNodes).index(this))
            return false;
        })
}

$(function(){

    if (window.curPostId !== undefined) {
        //на странице с открытой статьей
        $('.m_block').css({
            position: 'relative',
            'z-index': 2
        })
        $('.r_block').css({
            position: 'absolute',
            'z-index': 1,
            top: 0,
            right: 0,
            width: '740px'
        })
    }

    rebuild_preview();
    rebuild_label();
    
});


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