const BASEAPI_URL = "http://localhost:3000/api"

export async function getProducts() {
	const res = await fetch(`${BASEAPI_URL}/products`);
	if (!res.ok) throw new Error("Failed to fetch products");
	return res.json();
}

export async function getProduct(id: string) {
	const res = await fetch(`${BASEAPI_URL}/products/${id}`);
	if (!res.ok) throw new Error("Product not found");
	return res.json();
}

export async function updateProduct(id: string, data: { name: string; description: string; price: number }) {
	console.log("eqwe")
	const res = await fetch(`${BASEAPI_URL}/products/${id}`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data)
	});
	if (!res.ok) throw new Error("Failed to update product");
	return await res.json();
}

export async function deleteProduct(id: string) {
	const res = await fetch(`${BASEAPI_URL}/products/${id}`, { method: "DELETE" });
	if (!res.ok) throw new Error("Failed to delete product");
	return await res.json();
}
