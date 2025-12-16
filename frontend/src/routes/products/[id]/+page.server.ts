import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
	const { id } = event.params;

	console.log('Loading product with ID:', id);

	try {
		const res = await fetch(`http://backend:3000/api/products/${id}`);

		console.log('Response status:', res.status);

		if (!res.ok) {
			if (res.status === 404) {
				throw error(404, `Product with ID ${id} not found`);
			}
			throw error(res.status, 'Failed to fetch product');
		}

		const product = await res.json();

		console.log('Loaded product:', product);

		if (!product || !product.id) {
			throw error(500, 'Invalid product data received');
		}

		return {
			id: product.id,
			name: product.name || '',
			description: product.description || null,
			price: Number(product.price) || 0,
		};
	} catch (err) {
		console.error('Error loading product:', err);

		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}

		throw error(500, 'Failed to load product: ' + (err instanceof Error ? err.message : String(err)));
	}
}