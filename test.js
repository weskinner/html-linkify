var test = require("tape");
var linkify = require("./");

var ATTRS_SINGLE = {
	attributes: { class: "test" },
};

var ATTRS_MULTI = {
	attributes: {
		id: "foo",
		class: "test",
	},
};

var ATTRS_RESERVED = {
	attributes: { id: "foo\"bar" },
};

var ATTRS_XSS = {
	attributes: { class: "<script>" },
};

test("linkify", function(t) {
	// No links
	[
		"hello world",
		"foo bar.com",
	].forEach(function(url) {
		t.equal(linkify(url), url);
	});

	// Simple link
	t.equal(linkify("foo www.bar.com"),
		"foo <a href=\"http://www.bar.com\">www.bar.com</a>");

	// Link with protocol
	t.equal(linkify("https://bar.com foo"),
		"<a href=\"https://bar.com\">https://bar.com</a> foo");

	// Attribute
	t.equal(linkify("foo https://bar.com", ATTRS_SINGLE),
		"foo <a href=\"https://bar.com\" class=\"test\">https://bar.com</a>");

	// Multiple attributes
	t.equal(linkify("foo https://bar.com", ATTRS_MULTI),
		"foo <a href=\"https://bar.com\" id=\"foo\" class=\"test\">https://bar.com</a>");

	// Reserved character
	t.equal(linkify("foo &.foo.com bar"),
		"foo &amp;.foo.com bar");

	// Reserved character in attributes
	t.equal(linkify("www.foo.com", ATTRS_RESERVED),
		'<a href="http://www.foo.com" id="foo&quot;bar">www.foo.com</a>');

	// XSS in attributes
	t.equal(linkify("http://bar.com", ATTRS_XSS),
		'<a href="http://bar.com" class="&lt;script&gt;">http://bar.com</a>');

	// XSS in url
	t.equal(linkify("foo https://b<script>r.com"),
		"foo https://b&lt;script&gt;r.com");

	// XSS in text with present urls
	t.equal(linkify("foo http://bar.com <script> http://foo.com <script> bar"),
		'foo <a href="http://bar.com">http://bar.com</a> &lt;script&gt; <a href="http://foo.com">http://foo.com</a> &lt;script&gt; bar');

	// Multi urls
	t.equal(linkify("foo http://bar.com www.foo.com http://baz.com"),
		'foo <a href="http://bar.com">http://bar.com</a> <a href="http://www.foo.com">www.foo.com</a> <a href="http://baz.com">http://baz.com</a>');

	t.end();
});