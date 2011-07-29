/*global jsdi, QUnit */

var equals = QUnit.equals;
var ok = QUnit.ok;
var raises = QUnit.raises;
var test = QUnit.test;

function B() {
	this.name = "B";
}

function A() {
	var self = this;
	self.valueSetInConstructor = 42;
	self.b = jsdi.inject(B);
}

test("get bean by type", function() {
	var a, configuration;

	configuration = new jsdi.Configuration({
		beans : [ {
			type : A,
			ctor : function() {
				return new A();
			}
		}, {
			type : B,
			ctor : function() {
				return new B();
			}
		} ]
	});

	a = configuration.getBean(A);

	ok(a.b.name === "B");
});

test("get bean by id", function() {
	var a, configuration, x, y;

	configuration = new jsdi.Configuration({
		beans : [ {
			id : "x",
			ctor : function() {
				return {
					id : "x"
				};
			}
		}, {
			id : "y",
			ctor : function() {
				return {
					x : jsdi.resource("x")
				};
			}
		} ]
	});

	test("prototype scope", function() {
		var configuration;

		configuration = new jsdi.Configuration({
			beans : [ {
				type : B,
				scope : "prototype",
				ctor : function() {
					return new B();
				}
			}, {
				id : "x",
				ctor : function() {
					var self = {};
					self.b = jsdi.inject(B);
					return self;
				}
			}, {
				type : A,
				ctor : function() {
					return new A();
				}
			} ]
		});
		x = configuration.getBean("x");
		a = configuration.getBean(A);
		ok(a.b);
		ok(x.b);
		ok(a.b !== x.b);
	});

	y = configuration.getBean("y");

	equals("x", y.x.id);
});

test("inject requires function", function() {
	raises(function() {
		jsdi.inject(42);
	});
});

test("requires string id", function() {
	raises(function() {
		jsdi.resource(42);
	});
});
