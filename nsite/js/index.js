var Builder = function() {
    return {
        count: 10,

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

        init: function (wrapper) {

            this.elements = (function() {
                var buf = [];
                blocks = wrapper.children();
                for (var i=0;i<blocks.length;i++) {
                    buf.push({elem: blocks.eq(i), params: {x:null, y:null}})
                    if (blocks.eq(i).hasClass('cblock')) {
                        buf[i].params.r = blocks.eq(i).hasClass('cb_big') ? 3 : (blocks.eq(i).hasClass('cb_medium') ? 2 : 1)
                    } else {
                        buf[i].params.r = blocks.eq(i).hasClass('rb_big') ? 5 : (blocks.eq(i).hasClass('rb_medium') ? 3 : 2)
                    }
                }
                return buf;
            })();

            // console.log(this.elements)

            this.wrapper = wrapper;

            // wrapper.html('');
            this.width = Math.floor(wrapper.width()/50);

            for (var i=0;i<this.width;i++) this._map[i] = new Array();

            // this.squares = (function(count) {
            //     var buf = [],
            //         i = 0;

            //     // create proportional array
            //     for (i=0;i<count;i++) {
            //         buf.push({
            //             type: (i<count/2 ? '0' : (i<count*5/6 ? '1': '2'))
            //         })
            //     }

            //     // Randomize array
            //     for (i = buf.length - 1; i > 0; i--) {
            //         var j = Math.floor(Math.random() * (i + 1));
            //         var temp = buf[i];
            //         buf[i] = buf[j];
            //         buf[j] = temp;
            //     }

            //     return buf;
            // })(this.count)
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

            this.wrapper.find('.xl').removeClass('xl');

            for (i=0;i<elements.length;i++) {
                elements[i].params.r = elements[i].init_params.r;
            }

            for (i=0;i<this.width;i++) this._map[i] = new Array();

            if (elem.params.x>this.width-7) elem.params.x = this.width-7;
            elem.params.r = 7;
            this.set(elem.params.x, elem.params.y, elem.params.r, elem)
            elem.elem.addClass('xl');


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

        },

        getHeight: function () {
            var elements = this.elements,
                i,h=0;

            for (i=0;i<elements.length;i++) {
                h = Math.max(h, elements[i].params.y+elements[i].params.r)
            }
            return h;
        },

        build: function (wrapper) {

            this.init(wrapper);
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

    $('.m_block').hide();
    $('.r_block').css({width:'740px'});
    $('.rb_blocks').css({width: 'auto'})
    $('.rb_blocks').css({'margin-right': '-5px'})

    cBlocks = new Builder(),
        rBlocks = new Builder();

    cBlocks.build($('.cblocks'))
    rBlocks.build($('.rb_blocks'))
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