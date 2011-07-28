/*global $ */

/**
 * jQuery plugin for a dependency injection container.
 */
(function($) {
    var Configuration, BeanReference;

    BeanReference = function(id) {
        this.id = id;
    };

    /**
     * @class a configuration responsible for wiring up beans.  Basic Usage:
     * <code><pre>
     *     var configuration = new $.fn.inject.Configuration({
     *          beans: [
     *              {
     *                  type: A,
     *                  ctor: function() {
     *                      return new A();
     *                  }
     *               },
     *               {
     *                   id: "beanId",
     *                   ctor: function() {
     *                       return new B();
     *                   }
     *               }
     *          ]
     *     });
     * </pre></code>
     * @param options
     */
    Configuration = function(options) {
        var self = this;
        self.beans = [];
        $.extend(self, options);
    };

    $.fn.inject = function(type) {
        if (typeof type === "function") {
            return new BeanReference(type);
        } else {
            throw new Error("Required type for inject, got " + type);
        }
    };

    $.fn.inject.byBeanId = function(beanId) {
        if (typeof beanId === "string") {
            return new BeanReference(beanId);
        } else {
            throw new Error("Required bean ID for inject.byBeanId, got " + beanId);
        }
    };

    $.fn.inject.Configuration = Configuration;

    /**
     * Returns a bean for the given id, which should either be a String identifier or a type (function).
     *
     * @param id the bean Id.
     */
    Configuration.prototype.getBean = function(id) {
        var self = this;
        return self._resolveBean(self._beanDef(id));
    };

    // private Configuration methods
    Configuration.prototype._beanDef = function(id) {
        var self = this, result, description;

        $.each(self.beans, function(index, beanDefinition) {
            if (beanDefinition.id === id || beanDefinition.type === id) {
                result = beanDefinition;
                return false;
            }
        });
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

    Configuration.prototype._resolveBean = function(beanDefinition) {
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

    Configuration.prototype._resolveBeanProperty = function(bean, property) {
        var self = this, value = bean[property];
        if (value instanceof BeanReference) {
            bean[property] = self.getBean(value.id);
        }
    };

})(jQuery);
