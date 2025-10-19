import { AffineTransform } from "@/lib/geometry/transform";
import type { Vector } from "@/lib/geometry/vector";

export interface InteractionOptions {
	preventDefault?: boolean;
	stopPropagation?: boolean;
	threshold?: number;
	direction?: Vector;
}

export interface InteractionEvent {
	originalEvent: any;
	delta?: { x: number; y: number };
	factor?: number;
	angle?: number;
	active?: boolean;
}

export type InteractionHandler = (event: InteractionEvent) => void;

export class Interactive {
	private interactionHandlers = new Map<string, InteractionHandler[]>();

	on(event: string, handler: InteractionHandler): this {
		if (!this.interactionHandlers.has(event)) {
			this.interactionHandlers.set(event, []);
		}
		this.interactionHandlers.get(event)!.push(handler);
		return this;
	}

	off(event: string, handler?: InteractionHandler): this {
		if (handler) {
			const handlers = this.interactionHandlers.get(event);
			if (handlers) {
				const index = handlers.indexOf(handler);
				if (index > -1) {
					handlers.splice(index, 1);
				}
			}
		} else {
			this.interactionHandlers.delete(event);
		}
		return this;
	}

	emit(event: string, data: InteractionEvent): void {
		const handlers = this.interactionHandlers.get(event);
		if (handlers) {
			handlers.forEach((handler) => handler(data));
		}
	}

	tappable(options: InteractionOptions = {}): this {
		const handler = (event: InteractionEvent) => {
			if (options.preventDefault) event.originalEvent.preventDefault();
			if (options.stopPropagation) event.originalEvent.stopPropagation();

			this.emit("tap", event);
		};

		this.on("tap", handler);
		return this;
	}

	draggable(options: InteractionOptions = {}): this {
		const handler = (event: InteractionEvent) => {
			if (options.preventDefault) event.originalEvent.preventDefault();
			if (options.stopPropagation) event.originalEvent.stopPropagation();

			this.emit("drag", event);
		};

		this.on("drag", handler);
		return this;
	}

	scalable(options: InteractionOptions = {}): this {
		const handler = (event: InteractionEvent) => {
			if (options.preventDefault) event.originalEvent.preventDefault();
			if (options.stopPropagation) event.originalEvent.stopPropagation();

			this.emit("scale", event);
		};

		this.on("scale", handler);
		return this;
	}

	rotatable(options: InteractionOptions = {}): this {
		const handler = (event: InteractionEvent) => {
			if (options.preventDefault) event.originalEvent.preventDefault();
			if (options.stopPropagation) event.originalEvent.stopPropagation();

			this.emit("rotate", event);
		};

		this.on("rotate", handler);
		return this;
	}

	slidable(options: InteractionOptions = {}): this {
		const handler = (event: InteractionEvent) => {
			if (options.preventDefault) event.originalEvent.preventDefault();
			if (options.stopPropagation) event.originalEvent.stopPropagation();

			this.emit("slide", event);
		};

		this.on("slide", handler);
		return this;
	}

	holdable(options: InteractionOptions = {}): this {
		const handler = (event: InteractionEvent) => {
			if (options.preventDefault) event.originalEvent.preventDefault();
			if (options.stopPropagation) event.originalEvent.stopPropagation();

			this.emit("hold", event);
		};

		this.on("hold", handler);
		return this;
	}

	approachable(options: InteractionOptions = {}): this {
		const handler = (event: InteractionEvent) => {
			if (options.preventDefault) event.originalEvent.preventDefault();
			if (options.stopPropagation) event.originalEvent.stopPropagation();

			this.emit("approach", event);
		};

		this.on("approach", handler);
		return this;
	}
}
