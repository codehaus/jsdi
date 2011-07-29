/**
 * Dependency injection for JavaScript that leverages the Java 5 approach.
 */
var jsdi = {
	/**
	 * Internal place holder for a bean.
	 */
	_BeanReference : function(id) {
		this.id = id;
	},

	/**
	 * @class a configuration responsible for wiring up beans. Basic Usage:
	 *        <code>
	 * var configuration = new jsdi.Configuration({
	 *   beans : [ {
	 *     type : A,
	 *     ctor : function() {
	 *       return new A();
	 *     }
	 *   }, {
	 *     id : &quot;beanId&quot;,
	 *     ctor : function() {
	 *       return new B();
	 *     }
	 *   } ]
	 * });
	 * 
	 * </code>
	 * @param configuration
	 */
	Configuration : function(config) {
		var self = this;
		self.beans = config.beans;
	},

	/**
	 * Inject a bean given a type. This is preferred to resource() as it makes
	 * your code more portable across different application contexts.
	 */
	inject : function(type) {
		if (typeof type === "function") {
			return new jsdi._BeanReference(type);
		} else {
			throw new Error("Required type for inject(), got " + type);
		}
	},

	/**
	 * Inject a bean given its identifier.
	 */
	resource : function(beanId) {
		if (typeof beanId === "string") {
			return new jsdi._BeanReference(beanId);
		} else {
			throw new Error("Required bean ID for resource(), got " + beanId);
		}
	}

};

/**
 * Returns a bean for the given id, which should either be a String identifier
 * or a type (function).
 * 
 * @param id
 *            the bean Id.
 */
jsdi.Configuration.prototype.getBean = function(id) {
	var self = this;
	return self._resolveBean(self._beanDef(id));
};

/**
 * Resolves all beans given a scope.
 * 
 * @param scope
 *            the object to search bean definitions for.
 */
jsdi.Configuration.prototype.resolve = function(scope) {
	var self = this, i, obj;
	for (i in scope) {
		obj = scope[i];
		if (obj.id !== undefined) {
			try {
				scope[i] = self._resolveBean(self._beanDef(obj.id));
			} catch (e) {
				// Don't care we can't resolve something.
			}
		}
	}
};

/**
 * Return a bean definition given either a type or name.
 */
jsdi.Configuration.prototype._beanDef = function(id) {
	var self = this, i, beanDefinition, result, description;

	for (i in self.beans) {
		beanDefinition = self.beans[i];
		if (beanDefinition.id === id || beanDefinition.type === id) {
			result = beanDefinition;
			break;
		}
	}
	if (!result) {
		if (id.constructor && id.constructor.name) {
			description = id.constructor.name;
		} else {
			description = id;
		}
		throw "No bean definition found for " + description;
	}
	return result;
};

/**
 * Resolve a bean definition to an actual bean.
 */
jsdi.Configuration.prototype._resolveBean = function(beanDefinition) {
	var self = this, bean, property;
	
	if (!beanDefinition.bean || beanDefinition.scope === 'prototype') {
		bean = beanDefinition.ctor();
		beanDefinition.bean = bean;
		for (property in bean) {
			self._resolveBeanProperty(bean, property);
		}
	}
	return beanDefinition.bean;
};

/**
 * Copy a bean's properties.
 */
jsdi.Configuration.prototype._resolveBeanProperty = function(bean, property) {
	var self = this, value;
	
	value = bean[property];
	if (value instanceof jsdi._BeanReference) {
		bean[property] = self.getBean(value.id);
	}
};
