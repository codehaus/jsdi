/*global $, QUnit */

var equals = QUnit.equals;
var ok = QUnit.ok;
var test = QUnit.test;

function A() {
    var self = this;
    self.valueSetInConstructor = 42;
    self.b = $.fn.inject(B);
}

function B() {
    this.name = "B";
}

test("get bean by type", function() {
    var configuration = new $.fn.inject.Configuration({
        beans: [
            {
                type: A,
                ctor: function() {
                    return new A();
                }
            },
            {
                type: B,
                ctor: function() {
                    return new B();
                }
            }
        ]
    });

    var a = configuration.getBean(A);

    ok(a.b.name === "B");
});

test("get bean by id", function() {
    var configuration = new $.fn.inject.Configuration({
        beans: [
            {
                id: "x",
                ctor: function() {
                    return {id: "x"};
                }
            },
            {
                id: "y",
                ctor: function() {
                    return {x: $.fn.inject.byBeanId("x")};
                }
            }
        ]
    });

    test("prototype scope", function() {
        var configuration = new $.fn.inject.Configuration({
            beans: [
                {
                    type: B,
                    scope: "prototype",
                    ctor: function() {
                        return new B();
                    }
                },
                {
                    id: "x",
                    ctor: function() {
                        var self = {};
                        self.b = $.fn.inject(B);
                        return self;
                    }
                },
                {
                    type: A,
                    ctor: function() {
                        return new A();
                    }
                }
            ]
        });
        var x = configuration.getBean("x");
        var a = configuration.getBean(A);
        ok(a.b);
        ok(x.b);
        ok(a.b !== x.b);
    });

    var y = configuration.getBean("y");

    equals("x", y.x.id);
});

test("inject requires function", function() {
    raises(function() {
        $.fn.inject(42);
    });
});

test("requires string id", function() {
    raises(function() {
        $.fn.inject.byBeanId(42);
    });
});
