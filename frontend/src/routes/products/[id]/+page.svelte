<script lang="ts">
    import { updateProduct, deleteProduct } from '$lib/api';
    import { Card } from '$lib/components/ui/card';
    import { Input } from "@/components/ui/input";

    export let data: { id: string; name: string; description: string | null; price: number };

    console.log('Component received data:', data);

    if (!data || !data.id) {
        console.error('Invalid data received:', data);
    }

    let name = data?.name || '';
    let description = data?.description ?? "";
    let price = data?.price || 0;
    let message = "";
    let isLoading = false;

    async function handleUpdate() {
        isLoading = true;
        message = "";
        try {
            await updateProduct(data.id, {
                name,
                description,
                price: Number(price)
            });
            message = "Product updated!";
        } catch (err) {
            message = "Update failed: " + (err instanceof Error ? err.message : String(err));
            console.error(err);
        } finally {
            isLoading = false;
        }
    }

    async function handleDelete() {
        if (!confirm("Are you sure you want to delete this product?")) return;

        isLoading = true;
        message = "";
        try {
            await deleteProduct(data.id);
            message = "Product deleted! Redirecting...";
            setTimeout(() => {
                window.location.href = "/";
            }, 1000);
        } catch (err) {
            message = "Delete failed: " + (err instanceof Error ? err.message : String(err));
            console.error(err);
            isLoading = false;
        }
    }
</script>

<h1 class="text-3xl font-bold mb-4">Edit Product</h1>

{#if message}
    <p class="text-sm mb-4" class:text-green-600={message.includes('updated') || message.includes('deleted')} class:text-red-600={message.includes('failed')}>
        {message}
    </p>
{/if}

<Card class="p-6 space-y-4">
    <div class="space-y-2">
        <label for="name" class="text-sm font-medium">Name</label>
        <Input id="name" bind:value={name} disabled={isLoading} />
    </div>

    <div class="space-y-2">
        <label for="description" class="text-sm font-medium">Description</label>
        <Input id="description" bind:value={description} disabled={isLoading} />
    </div>

    <div class="space-y-2">
        <label for="price" class="text-sm font-medium">Price</label>
        <Input id="price" type="number" step="0.01" bind:value={price} disabled={isLoading} />
    </div>

    <div class="flex gap-2">
        <button
                type="button"
                on:click={handleUpdate}
                disabled={isLoading}
                class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
            {isLoading ? 'Updating...' : 'Update'}
        </button>
        <button
                type="button"
                on:click={handleDelete}
                disabled={isLoading}
                class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2"
        >
            {isLoading ? 'Deleting...' : 'Delete'}
        </button>
    </div>
</Card>