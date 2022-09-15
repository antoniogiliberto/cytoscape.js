/* global $, cy, notify, window, document */

(function () {

    var assign = function (tgt) {
        var args = arguments;

        for (var i = 1; i < args.length; i++) {
            var obj = args[i];

            if (obj == null) {
                continue;
            }

            var keys = Object.keys(obj);

            for (var j = 0; j < keys.length; j++) {
                var k = keys[j];

                tgt[k] = obj[k];
            }
        }

        return tgt;
    };

    var tests = {}; // name => setup
    function test(options) {
        var option = document.createElement('option');

        option.value = options.name;
        option.innerHTML = options.displayName;

        $('#test-type-select').appendChild(option);

        tests[options.name] = assign({}, {
            setup: function () {
            },
            teardown: function () {
            },
            description: ''
        }, options);
    }

    test({
        name: 'none',
        displayName: 'None',
        description: 'Not currently running any test'
    });

    var currentTest;
    for (var i in tests) {
        currentTest = tests[i];
        break;
    }

    $('#note').addEventListener('click', function () {
        $('#note').style.display = 'none';
    });

    $('#test-type-select').addEventListener('change', function () {
        currentTest.teardown();

        var name = $('#test-type-select').value;
        currentTest = tests[name];

        notify(currentTest.displayName, currentTest.description);

        currentTest.setup();
    });

    function randomColor() {
        function randCh() {
            return Math.round(Math.random() * 255);
        }

        return 'rgb(' + randCh() + ', ' + randCh() + ', ' + randCh() + ')';
    }

    test({
        name: 'complex-taxi',
        displayName: 'complex-taxi',
        description: 'complex-taxi',
        setup: function () {
            cy.elements().remove();
            cy.style()
                .fromJson([{
                    selector: 'node',
                    style: {
                        'height': 36,
                        'width': 36,
                        'z-index': 9,

                    }
                },
                    {
                        selector: 'edge',
                        style: {
                            'line-color': '#777'
                        }
                    },
                    {
                        selector: 'node[label]',
                        style: {
                            'text-outline-width': 2,
                            'text-outline-color': '#333',
                            'color': '#fff',
                            label: 'data(label)',
                            'font-size': 12,
                        }
                    },
                    {
                        selector: 'node[type="inventory"]',
                        style: {
                            'background-color': '#777',
                            shape: 'rectangle',
                            padding: 0,
                            height: 300,
                            'min-height': 300,
                            width: 40,
                            'min-width': 40,
                            'text-valign': 'center',
                            'text-halign': 'center',
                            'text-rotation': '-90deg',
                            'font-size': 16,
                            'text-outline-width': 0,

                        }
                    },
                    {
                        selector: 'node[type="process"]',
                        style: {
                            shape: 'rectangle',
                            // height: (ele) => {
                            //     console.log('update style')
                            //     return calcHeightByOutgoers(ele)
                            // }
                        }
                    },
                    {
                        selector: 'edge[source^="inventory"][target^="process"]',
                        style: {
                            'source-endpoint': '50% -50%',
                            // 'target-endpoint': '0 -50%',
                            'curve-style': 'simple',
                            // 'segment-weights': '1',
                            // 'segment-distances': '100%',
                            // 'taxi-direction': 'horizontal',
                            // 'taxi-turn': '150%',
                            // 'taxi-turn-min-distance': 5
                        }
                    },
                    {
                        selector: 'edge[source^="process"][target^="output"]',
                        style: {
                            'curve-style': 'bezier',
                            // 'taxi-direction': 'horizontal',
                            // 'taxi-turn': '20',
                            // 'target-arrow-shape': 'triangle',
                            'target-arrow-color': '#777',
                            'source-endpoint': (ele) => `50% ${ele.target().position('y') - (ele.source().height() / 2) + (ele.target().height() / 2)}`
                            // 'taxi-turn-min-distance': 5
                        }
                    },
                    {
                        selector: 'edge[source^="output"][target^="process"]',
                        style: {
                            'curve-style': 'complex-taxi',
                            'complex-taxi-horizontal-padding': 32,
                            'complex-taxi-vertical-padding': 32,
                            'taxi-direction': 'horizontal',
                            'taxi-turn': '-20',
                            'target-arrow-shape': 'triangle',
                            'target-arrow-color': '#777',
                            // 'taxi-turn-min-distance': 5
                        }
                    },
                    {
                        selector: 'edge[source^="output"][target^="inventory"]',
                        style: {
                            'curve-style': 'coords',
                            'coords-points': [
                                300,
                                200,
                                0,
                                200
                            ],
                            'source-endpoint': '0 50%',
                            'target-endpoint': '0 50%',
                        }
                    },
                    {
                        selector: 'edge[source^="process"][target^="waste"]',
                        style: {
                            'curve-style': 'bezier',
                            'line-color': '#333'
                        }
                    },
                    {
                        selector: 'edge[source^="supplier"]',
                        style: {
                            'source-endpoint': '50% 0',
                            'target-endpoint': (ele) => `-50% ${ele.source().position('y')}`
                        }
                    },
                    {
                        selector: ':parent',
                        style: {
                            color: 'white',
                            'text-valign': 'bottom',
                            'text-halign': 'center',
                            'background-opacity': 0,
                            'padding': 20,
                            'text-outline-width': 2,
                            'text-outline-color': '#333',
                            'font-size': 13,
                            'border-color': '#999',
                            'border-width': 4
                        }
                    }])
                .update();
            (
                fetch('./complex-taxi.json')
                    .then(function (res) {
                        return res.json();
                    }).then(function (eleJsons) {
                    cy.add(eleJsons);

                    // cy.layout({ name: 'grid' }).run();

                    cy.center();
                })
            );
        }
    });

    test({
        name: 'gal',
        displayName: 'Load GAL-filtered',
        description: 'Load an example network',
        setup: function () {
            cy.elements().remove();

            (
                fetch('./gal.json')
                    .then(function (res) {
                        return res.json();
                    }).then(function (eleJsons) {
                    cy.add(eleJsons);

                    cy.layout({name: 'grid'}).run();

                    cy.fit();
                })
            );
        }
    });

    test({
        name: 'randomEdgeColors',
        displayName: 'Random edge colours',
        description: 'Set each edge to a random colour',
        setup: function () {
            cy.edges().each(function (ele) {
                ele.css('line-color', randomColor());
            });
        },
        teardown: function () {
            cy.edges().removeCss();
        }
    });

    test({
        name: 'bypassOnClick',
        displayName: 'Bypass on click',
        description: 'Set nodes to red and edges to orange on click',
        setup: function () {
            cy.elements().bind('click', function () {
                this.css('background-color', 'red');

                this.css({
                    lineColor: 'orange',
                    targetArrowColor: 'orange',
                    sourceArrowColor: 'orange'
                });
            });
        },
        teardown: function () {
            cy.elements().unbind('click').css('*', '');
        }
    });

    test({
        name: 'shapeOnClick',
        displayName: 'Squares on click',
        description: 'Set nodes to squares and edge arrows to squares on click',
        setup: function () {
            cy.elements().bind('click', function () {
                this.css({
                    shape: 'rectangle',
                    targetArrowShape: 'square',
                    sourceArrowShape: 'square'
                });
            });
        },
        teardown: function () {
            cy.elements().unbind('click').css('*', '');
        }
    });

    test({
        name: 'positionOnClick',
        displayName: 'Random position on click',
        description: 'Put node to random position on click',
        setup: function () {
            var w = cy.width();
            var h = cy.height();

            cy.nodes().bind('click', function () {
                var node = this;
                var padding = 50;

                var p2 = {
                    x: Math.random() * (w - padding) + padding,
                    y: Math.random() * (h - padding) + padding
                };

                node.animate({
                        position: p2
                    },
                    {
                        duration: 1000
                    });
            });
        },
        teardown: function () {
            cy.elements().unbind('click');
        }
    });


    test({
        name: 'labelOnClick',
        displayName: 'Label on click',
        description: 'Change label on click',
        setup: function () {
            cy.elements().bind('click', function () {
                this.css({
                    content: 'clicked'
                });
            });
        },
        teardown: function () {
            cy.elements().unbind('click').css('*', '');
        }
    });


    test({
        name: 'labelWithWeight',
        displayName: 'Labels with weight',
        description: 'Show weight in element labels',
        setup: function () {
            cy.style()
                .selector('*')
                .css({
                    'content': 'data(weight)'
                })

                .update()
            ;
        },

        teardown: function () {
            var stylesheet = window.defaultSty;

            cy.style(stylesheet);
        }
    });


    test({
        name: 'hideOnClick',
        displayName: 'visibility:hidden on click',
        description: 'visibility:hidden on nodes and edges when clicked',
        setup: function () {
            cy.elements().bind('click', function () {
                this.style('visibility', 'hidden');
            });
        },
        teardown: function () {
            cy.elements().unbind('click').css('*', '');
        }
    });

    test({
        name: 'hideOnClick2',
        displayName: 'display:none on click',
        description: 'display:none on nodes and edges when clicked',
        setup: function () {
            cy.elements().bind('click', function () {
                this.css('display', 'none');
            });
        },
        teardown: function () {
            cy.elements().unbind('click').css('*', '');
        }
    });

    test({
        name: 'hideOnClick3',
        displayName: 'opacity:0 on click',
        description: 'opacity:0 on nodes and edges when clicked',
        setup: function () {
            cy.elements().bind('click', function () {
                this.css('opacity', 0);
            });
        },
        teardown: function () {
            cy.elements().unbind('click').css('*', '');
        }
    });

    test({
        name: 'growOnClick',
        displayName: 'Coloured and sized',
        description: 'Make nodes grow/shrink and change colour on click',
        setup: function () {
            cy.nodes().bind('click', function () {
                function rch() {
                    return Math.round(Math.random() * 255);
                }

                function rcolor() {
                    return 'rgb(' + rch() + ',' + rch() + ',' + rch() + ')';
                }

                function rsize() {
                    return 5 + Math.round(Math.random() * 50);
                }

                var size = rsize();

                this.stop().animate({
                    css: {
                        backgroundColor: rcolor(),
                        height: size,
                        width: size
                    }
                }, {
                    duration: 1000
                });
            });
        },
        teardown: function () {
            cy.elements().unbind('click').removeCss();
        }
    });

    test({
        name: 'colourThenGrow',
        displayName: 'Orange, delay, grow, reset',
        description: 'Click nodes to trigger',
        setup: function () {
            cy.nodes().bind('click', function () {
                var self = this;
                self
                    .stop(true)
                    .animate({
                            css: {
                                backgroundColor: 'orange'
                            }
                        },
                        {
                            duration: 1000
                        })
                    .delay(1000)
                    .animate({
                            css: {
                                height: 50,
                                width: 50
                            }
                        },
                        {
                            duration: 1000
                        }).delay(1000, function () {
                    self.removeCss();
                });
            });

            cy.edges().bind('click', function () {
                this
                    .stop(true)
                    .animate({
                            bypass: {
                                lineColor: 'orange',
                                targetArrowColor: 'orange',
                                sourceArrowColor: 'orange'
                            }
                        },
                        {
                            duration: 1000
                        })
                    .delay(1000)
                    .animate({
                            css: {
                                width: 7
                            }
                        },
                        {
                            duration: 1000
                        });
            });
        },
        teardown: function () {
            cy.elements().unbind('click').removeCss();
        }
    });

    test({
        name: 'redAndGrow',
        displayName: 'Blue and grow in parallel',
        description: 'Click nodes to trigger',
        setup: function () {
            cy.nodes().bind('click', function () {
                this
                    .stop(true)
                    .animate({
                            css: {
                                backgroundColor: 'blue'
                            }
                        },
                        {
                            duration: 1000
                        })
                    .animate({
                            css: {
                                height: 50,
                                width: 50
                            }
                        },
                        {
                            duration: 1000,
                            queue: false
                        });
            });
        },
        teardown: function () {
            cy.nodes().unbind('click').removeCss();
        }
    });

    test({
        name: 'bigRedOnClick',
        displayName: 'Big & red',
        description: 'Click background to toggle',
        setup: function () {
            var on = false;

            cy.bind('click', function () {


                if (!on) {
                    cy.nodes().stop().animate({
                            css: {
                                backgroundColor: 'red',
                                height: 50,
                                width: 50
                            }
                        },
                        {
                            duration: 2000
                        });

                    on = true;
                } else {
                    cy.nodes().stop().removeCss();
                    on = false;
                }

            });
        },
        teardown: function () {
            cy.unbind('click');
            cy.nodes().removeCss();
        }
    });

    test({
        name: 'bigRedOnClickE',
        displayName: 'Big & red edges',
        description: 'Click background to toggle',
        setup: function () {
            var on = false;

            cy.bind('click', function () {


                if (!on) {
                    cy.edges().stop().animate({
                            css: {
                                lineColor: 'red',
                                targetArrowColor: 'red',
                                sourceArrowColor: 'red',
                                width: 10
                            }
                        },
                        {
                            duration: 2000
                        });

                    on = true;
                } else {
                    cy.edges().stop().removeCss();
                    on = false;
                }

            });
        },
        teardown: function () {
            cy.unbind('click');
            cy.edges().removeCss();
        }
    });

    test({
        name: 'fancyStyle',
        displayName: 'Set a fancy visual style',
        description: 'Change the visual style and make sure it takes effect',
        setup: function () {

            cy.style()
                .resetToDefault()
                .selector('node')
                .css({
                    shape: 'rectangle',
                    backgroundColor: 'lightblue',
                    borderColor: 'black',
                    borderWidth: 1,
                    width: 'mapData(weight, 20, 100, 20, 100)',
                    height: 20,
                    labelFontWeight: 'normal',
                    labelFontSize: '0.75em',
                    content: 'data(weight)',
                    textValign: 'center',
                    textHalign: 'center'
                })
                .selector('edge')
                .css({
                    lineColor: 'mapData(weight, 0, 100, blue, red)',
                    targetArrowShape: 'triangle'
                })
                .selector('edge:selected')
                .css({
                    width: 3
                })
                .selector('node:selected')
                .css({
                    borderWidth: 3
                })
                .update()
            ;
        },

        teardown: function () {
            var stylesheet = window.defaultSty;

            cy.style(stylesheet);
        }
    });

    test({
        name: 'strStyle',
        displayName: 'Set a string stylesheet',
        description: 'Change the visual style and make sure it takes effect',
        setup: function () {
            cy.style('node { background-color: blue; }');
        },

        teardown: function () {
            var stylesheet = window.defaultSty;

            cy.style(stylesheet);
        }
    });

    test({
        name: 'addStyle',
        displayName: 'Add to current stylesheet',
        description: 'Add to the visual style and make sure it takes effect',
        setup: function () {
            cy.style()
                .selector('node')
                .css({
                    'background-color': 'blue'
                })

                .update()
            ;
        },

        teardown: function () {
            var stylesheet = window.defaultSty;

            cy.style(stylesheet);
        }
    });

    test({
        name: 'redTap',
        displayName: 'Mouseover nodes to toggle red bypass',
        description: '..',
        setup: function () {
            var on = {}; // id => true | false

            cy.on('mouseover', 'node', function () {
                if (on[this.id()]) {
                    this.removeCss();
                    on[this.id()] = false;
                } else {
                    this.css('background-color', 'red');
                    on[this.id()] = true;
                }
            });
        },

        teardown: function () {
            cy.off('mouseover', 'node');
        }
    });

    test({
        name: 'multAni',
        displayName: 'Multiple simultaneous animations',
        description: 'Tap node to start',
        setup: function () {
            cy.on('tap', 'node', function (e) {
                var n = e.target;
                var p = n.position();

                var a1 = n.animation({
                    style: {
                        'background-color': 'cyan'
                    },
                    position: {
                        x: p.x + 100,
                        y: p.y + 100
                    },
                    duration: 1000
                });

                a1.play();

                var a2 = n.animation({
                    style: {
                        'width': 60,
                        'height': 60
                    },
                    duration: 1000
                });

                a2.play().promise('complete').then(function () {
                    return a2.rewind().reverse().play().promise('complete');
                }).then(function () {
                    n.removeStyle();
                });
            });
        },

        teardown: function () {
            cy.off('tap', 'node');
        }
    });

    var faded = false;

    test({
        name: 'fadeAni',
        displayName: 'Animate element opacity',
        description: 'Tap background to toggle',
        setup: function () {
            cy.on('tap', function (e) {
                if (e.target !== cy) {
                    return;
                }

                faded = !faded;

                cy.elements().animate({
                    style: {
                        'opacity': faded ? 0.5 : 1
                    },
                    duration: 1000
                });
            });
        },

        teardown: function () {
            cy.off('tap');
            cy.elements().removeStyle();
        }
    });

    test({
        name: 'pngblob',
        displayName: 'Export big PNG image via promise',
        description: 'Tap background to save the file',
        setup: function () {
            cy.on('tap', function (e) {
                if (e.target !== cy) {
                    return;
                }

                console.time('pngblob');

                var save = function (blob) {
                    console.timeEnd('pngblob');

                    saveAs(blob, 'blob-promise.png');
                };

                var N = 10000;

                cy.png({output: 'blob-promise', maxWidth: N, maxHeight: N}).then(save);
            });
        },

        teardown: function () {
            cy.off('tap');
        }
    });

    test({
        name: 'png64',
        displayName: 'Export big PNG image via base64 blob',
        description: 'Tap background to save the file',
        setup: function () {
            cy.on('tap', function (e) {
                if (e.target !== cy) {
                    return;
                }

                console.time('png64');

                var save = function (blob) {
                    saveAs(blob, 'base64-blob.png');
                };

                var N = 10000;

                var blob = cy.png({output: 'blob', maxWidth: N, maxHeight: N});

                console.timeEnd('png64');

                save(blob);
            });
        },

        teardown: function () {
            cy.off('tap');
        }
    });

    test({
        name: 'randomLayoutAni',
        displayName: 'Animate random layout',
        description: 'Tap background to run layout',
        setup: function () {
            cy.on('tap', function (e) {
                if (e.target !== cy) {
                    return;
                }

                cy.layout({
                    name: 'random',
                    animate: true,
                    animationDuration: 1000
                }).run();
            });
        },

        teardown: function () {
            cy.off('tap');
        }
    });

    var de = cy.$('#de');
    var deToggle = false;

    test({
        name: 'rmBez',
        displayName: 'Remove bundled bezier',
        description: 'Tap background to toggle removing edge `de`',
        setup: function () {
            deToggle = false;

            cy.on('tap', function (e) {
                if (e.target !== cy) {
                    return;
                }

                deToggle = !deToggle;

                if (deToggle) {
                    de.remove();
                } else {
                    de.restore();
                }
            });
        },
        teardown: function () {
            cy.off('tap');
            de.restore();
        }
    });

    test({
        name: 'mvBez',
        displayName: 'Move bundled bezier',
        description: 'Tap background to toggle moving edge `de` to source `e` target `f`',
        setup: function () {
            deToggle = false;

            cy.on('tap', function (e) {
                if (e.target !== cy) {
                    return;
                }

                deToggle = !deToggle;

                if (deToggle) {
                    de.move({source: 'e', target: 'f'});
                } else {
                    de.move({source: 'd', target: 'e'});
                }
            });
        },
        teardown: function () {
            cy.off('tap');
            de.move({source: 'd', target: 'e'});
        }
    });
})();
